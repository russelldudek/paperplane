import type { AircraftGenome } from '../aircraft/genome'
import { getPaperMaterial } from '../materials/papers'
import type { ConfidenceLevel, Environment, LaunchProfile, NumericRange } from '../shared/types'
import { clamp, degreesToRadians, rangeAround, round } from '../shared/math'
import { estimateRelativeUncertainty } from './uncertainty'

const GRAVITY = 9.80665

interface FamilyAeroProfile {
  baseCd0: number
  oswaldEfficiency: number
  liftFactor: number
  neutralPoint: number
  directionalStability: number
  payloadStrength: number
}

const profiles: Record<AircraftGenome['family'], FamilyAeroProfile> = {
  'narrow-dart': { baseCd0: 0.085, oswaldEfficiency: 0.62, liftFactor: 0.82, neutralPoint: 0.38, directionalStability: 0.82, payloadStrength: 0.35 },
  'dart-glider': { baseCd0: 0.075, oswaldEfficiency: 0.68, liftFactor: 0.94, neutralPoint: 0.39, directionalStability: 0.78, payloadStrength: 0.48 },
  'broad-glider': { baseCd0: 0.069, oswaldEfficiency: 0.76, liftFactor: 1.08, neutralPoint: 0.41, directionalStability: 0.72, payloadStrength: 0.32 },
  'flying-wing': { baseCd0: 0.072, oswaldEfficiency: 0.79, liftFactor: 1.02, neutralPoint: 0.36, directionalStability: 0.56, payloadStrength: 0.3 },
  'accuracy-trainer': { baseCd0: 0.081, oswaldEfficiency: 0.72, liftFactor: 0.97, neutralPoint: 0.4, directionalStability: 0.94, payloadStrength: 0.45 },
  'stunt-loop': { baseCd0: 0.095, oswaldEfficiency: 0.64, liftFactor: 1.04, neutralPoint: 0.35, directionalStability: 0.5, payloadStrength: 0.2 },
  'payload-carrier': { baseCd0: 0.102, oswaldEfficiency: 0.69, liftFactor: 1.14, neutralPoint: 0.42, directionalStability: 0.87, payloadStrength: 1 },
}

export interface FlightPrediction {
  massG: number
  wingAreaM2: number
  spanM: number
  meanChordM: number
  aspectRatio: number
  wingLoadingNpm2: number
  reynoldsNumber: number
  liftCoefficient: number
  dragCoefficient: number
  stallSpeedMps: NumericRange
  glideRatio: NumericRange
  sinkRateMps: NumericRange
  distanceM: NumericRange
  airtimeS: NumericRange
  staticMarginPercent: number
  stabilityScore: number
  accuracySpreadM: NumericRange
  payloadMarginG: number
  confidence: ConfidenceLevel
  uncertainty: number
  labels: {
    calculated: string[]
    modeled: string[]
    heuristic: string[]
  }
}

function confidenceFromUncertainty(uncertainty: number, genome: AircraftGenome): ConfidenceLevel {
  if (genome.mission === 'aerobatics') return 'low'
  if (uncertainty <= 0.14) return 'high'
  if (uncertainty <= 0.23) return 'medium'
  return 'low'
}

export function simulateFlight(
  genome: AircraftGenome,
  environment: Environment,
  launch: LaunchProfile,
): FlightPrediction {
  const material = getPaperMaterial(genome.materialId)
  const profile = profiles[genome.family]
  const sheetArea = genome.sheet.widthM * genome.sheet.lengthM
  const paperMassKg = sheetArea * material.gsm / 1000
  const totalMassKg = paperMassKg + Math.max(0, genome.payloadMassG) / 1000
  const weightN = totalMassKg * GRAVITY

  const spanM = genome.sheet.widthM * clamp(genome.geometry.spanRatio, 0.42, 1)
  const meanChordM = genome.sheet.lengthM * clamp(genome.geometry.chordRatio, 0.2, 0.62)
  const planformEfficiency = clamp(genome.geometry.planformEfficiency, 0.5, 0.92)
  const wingAreaM2 = spanM * meanChordM * planformEfficiency
  const aspectRatio = spanM ** 2 / wingAreaM2
  const wingLoadingNpm2 = weightN / wingAreaM2

  const effectiveSpeed = Math.max(2, launch.speedMps - Math.max(0, environment.windSpeedMps * 0.2))
  const reynoldsNumber = environment.airDensityKgM3 * effectiveSpeed * meanChordM / environment.dynamicViscosityPaS

  const incidenceContribution = genome.geometry.wingIncidenceDeg * 0.055
  const controlContribution = genome.geometry.controlTabDeg * 0.018
  const liftCoefficient = clamp(0.26 + profile.liftFactor * 0.34 + incidenceContribution + controlContribution, 0.42, 1.18)
  const maximumLiftCoefficient = clamp(liftCoefficient + 0.22 + material.stiffness * 0.08, 0.65, 1.35)

  const roughnessPenalty = material.roughness * 0.014
  const layerPenalty = genome.geometry.layerDragFactor * 0.09
  const sweepPenalty = Math.abs(genome.geometry.sweepDeg - 24) * 0.00045
  const asymmetryPenalty = genome.geometry.symmetryError * 0.8
  const cd0 = profile.baseCd0 + roughnessPenalty + layerPenalty + sweepPenalty + asymmetryPenalty
  const inducedFactor = 1 / (Math.PI * profile.oswaldEfficiency * aspectRatio)
  const dragCoefficient = cd0 + inducedFactor * liftCoefficient ** 2
  const glideRatioNominal = clamp(liftCoefficient / dragCoefficient, 2.2, 13.5)

  const stallSpeedNominal = Math.sqrt((2 * weightN) / (environment.airDensityKgM3 * wingAreaM2 * maximumLiftCoefficient))
  const sinkRateNominal = clamp(
    Math.sqrt((2 * wingLoadingNpm2) / (environment.airDensityKgM3 * liftCoefficient)) / glideRatioNominal,
    0.34,
    2.4,
  )

  const cgChordFraction = clamp(0.39 - genome.geometry.noseMassFraction * 0.62 + genome.payloadMassG * 0.0016, 0.16, 0.48)
  const sweepNeutralShift = genome.geometry.sweepDeg * 0.00055
  const neutralPoint = profile.neutralPoint + sweepNeutralShift
  const staticMargin = (neutralPoint - cgChordFraction) * 100

  const dihedralContribution = clamp(genome.geometry.dihedralDeg / 14, 0, 1)
  const directionalContribution = clamp(profile.directionalStability + genome.geometry.verticalAreaRatio * 1.2, 0, 1)
  const marginContribution = clamp((staticMargin + 2) / 18, 0, 1)
  const symmetryContribution = clamp(1 - genome.geometry.symmetryError * 18, 0, 1)
  const stabilityScore = clamp(
    100 * (0.36 * marginContribution + 0.23 * dihedralContribution + 0.25 * directionalContribution + 0.16 * symmetryContribution),
    0,
    100,
  )

  const launchAngleRad = degreesToRadians(launch.elevationDeg)
  const transitionDistance = effectiveSpeed ** 2 * Math.cos(launchAngleRad) ** 2 / (2 * GRAVITY * (0.55 + dragCoefficient * 2.4))
  const altitudeBoost = Math.max(0, effectiveSpeed ** 2 * Math.sin(launchAngleRad) ** 2 / (2 * GRAVITY)) * 0.45
  const usableHeight = launch.releaseHeightM + altitudeBoost
  const glideDistance = usableHeight * glideRatioNominal
  const stabilityEfficiency = 0.62 + stabilityScore / 260
  const windLoss = environment.indoor ? 1 : clamp(1 - environment.windSpeedMps * 0.035, 0.68, 1.05)
  const distanceNominal = Math.max(1, (transitionDistance * 0.56 + glideDistance) * stabilityEfficiency * windLoss)
  const airtimeNominal = Math.max(0.7, usableHeight / sinkRateNominal + effectiveSpeed * Math.sin(launchAngleRad) / GRAVITY * 0.45)

  const accuracyNominal = clamp(
    distanceNominal * (0.035 + (100 - stabilityScore) * 0.0018 + launch.repeatability * 0.55 + environment.windSpeedMps * 0.02),
    0.25,
    distanceNominal * 0.75,
  )

  const structuralCapacityG = sheetArea * material.gsm * profile.payloadStrength * (0.18 + material.stiffness * 0.22)
  const payloadMarginG = Math.max(0, structuralCapacityG - genome.payloadMassG)
  const uncertainty = estimateRelativeUncertainty(genome, environment, launch)

  return {
    massG: round(totalMassKg * 1000, 2),
    wingAreaM2: round(wingAreaM2, 4),
    spanM: round(spanM, 3),
    meanChordM: round(meanChordM, 3),
    aspectRatio: round(aspectRatio, 2),
    wingLoadingNpm2: round(wingLoadingNpm2, 2),
    reynoldsNumber: Math.round(reynoldsNumber),
    liftCoefficient: round(liftCoefficient, 3),
    dragCoefficient: round(dragCoefficient, 3),
    stallSpeedMps: rangeAround(stallSpeedNominal, uncertainty * 0.55, 2),
    glideRatio: rangeAround(glideRatioNominal, uncertainty * 0.35, 2),
    sinkRateMps: rangeAround(sinkRateNominal, uncertainty * 0.45, 2),
    distanceM: rangeAround(distanceNominal, uncertainty, 1),
    airtimeS: rangeAround(airtimeNominal, uncertainty * 0.8, 2),
    staticMarginPercent: round(staticMargin, 1),
    stabilityScore: round(stabilityScore, 0),
    accuracySpreadM: rangeAround(accuracyNominal, uncertainty, 2),
    payloadMarginG: round(payloadMarginG, 1),
    confidence: confidenceFromUncertainty(uncertainty, genome),
    uncertainty: round(uncertainty, 3),
    labels: {
      calculated: ['mass', 'wing area', 'aspect ratio', 'wing loading', 'Reynolds number'],
      modeled: ['stall speed', 'glide ratio', 'sink rate', 'distance', 'airtime', 'static margin'],
      heuristic: ['accuracy spread', 'payload margin'],
    },
  }
}
