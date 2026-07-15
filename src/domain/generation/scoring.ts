import type { AircraftGenome } from '../aircraft/genome'
import type { FlightPrediction } from '../aerodynamics/model'
import type { Mission } from '../shared/types'
import { clamp, round } from '../shared/math'
import type { ValidationResult } from './validation'
export interface CandidateScores { mission: number; robustness: number; buildability: number; novelty: number; total: number }
function missionScore(mission: Mission, prediction: FlightPrediction): number {
  switch (mission) {
    case 'distance': return prediction.distanceM.nominal * 4 + prediction.glideRatio.nominal * 3 + prediction.stabilityScore * 0.18
    case 'airtime': return prediction.airtimeS.nominal * 17 + prediction.glideRatio.nominal * 2.5 - prediction.wingLoadingNpm2 * 1.1
    case 'accuracy': return prediction.stabilityScore * 0.7 + Math.max(0, 35 - prediction.accuracySpreadM.nominal * 12)
    case 'aerobatics': return Math.max(0, 86 - Math.abs(prediction.staticMarginPercent - 3) * 4) + prediction.airtimeS.nominal * 4
    case 'payload': return prediction.payloadMarginG * 3.2 + prediction.stabilityScore * 0.38 - prediction.stallSpeedMps.nominal * 2
  }
}
export function scoreCandidate(mission: Mission, genome: AircraftGenome, prediction: FlightPrediction, validation: ValidationResult): CandidateScores {
  const missionValue = clamp(missionScore(mission, prediction), 0, 100)
  const robustness = clamp(prediction.stabilityScore - prediction.uncertainty * 80, 0, 100)
  const buildability = clamp(100 - genome.foldComplexity * 82 - validation.warnings.length * 5, 0, 100)
  const novelty = genome.novelty * 100
  const total = missionValue * 0.54 + robustness * 0.22 + buildability * 0.17 + novelty * 0.07
  return { mission: round(missionValue, 1), robustness: round(robustness, 1), buildability: round(buildability, 1), novelty: round(novelty, 1), total: round(total, 1) }
}
