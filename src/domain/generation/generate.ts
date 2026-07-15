import type { FlightPrediction } from '../aerodynamics/model'
import { simulateFlight } from '../aerodynamics/model'
import { aircraftFamilies, createFamilyGenome } from '../aircraft/families'
import type { AircraftFamily, AircraftGenome } from '../aircraft/genome'
import type { ConstructionLevel, Environment, LaunchProfile, LearnerProfile, Mission } from '../shared/types'
import { calmEnvironment, standardLaunch } from '../shared/types'
import { mutateGenome } from './mutations'
import { createSeededRandom } from './random'
import { scoreCandidate, type CandidateScores } from './scoring'
import { validateGenome, type ValidationResult } from './validation'

export interface GenerationRequest {
  mission: Mission
  seed: number
  learner: LearnerProfile
  paperId?: AircraftGenome['materialId']
  constructionLevel?: ConstructionLevel
  payloadMassG?: number
  environment?: Environment
  launch?: LaunchProfile
  difficulty?: 'easy' | 'balanced' | 'challenging'
}

export interface GeneratedCandidate {
  role: 'best-match' | 'easiest-build' | 'experimental'
  genome: AircraftGenome
  prediction: FlightPrediction
  validation: ValidationResult
  scores: CandidateScores
  summary: string
}

const missionFamilies: Record<Mission, AircraftFamily[]> = {
  distance: ['narrow-dart', 'dart-glider', 'accuracy-trainer', 'broad-glider'],
  airtime: ['broad-glider', 'flying-wing', 'dart-glider', 'accuracy-trainer'],
  accuracy: ['accuracy-trainer', 'dart-glider', 'broad-glider', 'narrow-dart'],
  aerobatics: ['stunt-loop', 'flying-wing', 'dart-glider'],
  payload: ['payload-carrier', 'accuracy-trainer', 'broad-glider'],
}

function familySummary(genome: AircraftGenome, prediction: FlightPrediction): string {
  const behavior = prediction.stabilityScore >= 76 ? 'stable' : prediction.stabilityScore >= 58 ? 'responsive' : 'experimental'
  return `${behavior} ${genome.family.replaceAll('-', ' ')} with a modeled ${prediction.distanceM.low}–${prediction.distanceM.high} m flight envelope.`
}

function pickDiverse(candidates: Omit<GeneratedCandidate, 'role'>[]): GeneratedCandidate[] {
  const byTotal = [...candidates].sort((a, b) => b.scores.total - a.scores.total)
  const best = byTotal[0]
  const easiest = [...candidates]
    .filter(item => item.genome.id !== best.genome.id)
    .sort((a, b) => b.scores.buildability - a.scores.buildability || b.scores.total - a.scores.total)[0]
  const usedFamilies = new Set([best.genome.family, easiest.genome.family])
  const experimentalPool = [...candidates]
    .filter(item => item.genome.id !== best.genome.id && item.genome.id !== easiest.genome.id)
    .sort((a, b) => {
      const diversityA = usedFamilies.has(a.genome.family) ? 0 : 18
      const diversityB = usedFamilies.has(b.genome.family) ? 0 : 18
      return (b.scores.novelty + diversityB) - (a.scores.novelty + diversityA)
    })
  const experimental = experimentalPool[0] ?? byTotal[2]
  return [
    { ...best, role: 'best-match' },
    { ...easiest, role: 'easiest-build' },
    { ...experimental, role: 'experimental' },
  ]
}

export function generateCandidates(request: GenerationRequest): GeneratedCandidate[] {
  const random = createSeededRandom(request.seed)
  const families = missionFamilies[request.mission] ?? aircraftFamilies
  const environment = request.environment ?? calmEnvironment
  const launch = request.launch ?? standardLaunch
  const difficulty = request.difficulty ?? 'balanced'
  const intensity = difficulty === 'easy'
    ? { geometry: 0.45, novelty: 0.45, complexity: 0.55 }
    : difficulty === 'challenging'
      ? { geometry: 1, novelty: 1, complexity: 1 }
      : { geometry: 0.72, novelty: 0.72, complexity: 0.74 }
  const generated: Omit<GeneratedCandidate, 'role'>[] = []
  for (let index = 0; index < 28; index += 1) {
    const family = families[index % families.length]
    const parent = createFamilyGenome(family)
    const mutated = mutateGenome(parent, random, intensity, index)
    const constructionLevel = request.constructionLevel ?? (request.payloadMassG ? 2 : 1)
    const genome: AircraftGenome = {
      ...mutated,
      mission: request.mission,
      materialId: request.paperId ?? mutated.materialId,
      constructionLevel,
      payloadMassG: request.payloadMassG ?? 0,
    }
    const validation = validateGenome(genome)
    if (!validation.valid) continue
    const prediction = simulateFlight(genome, environment, launch)
    if (prediction.staticMarginPercent < -1.5 || prediction.stabilityScore < 28) continue
    if (request.mission === 'payload' && prediction.payloadMarginG < 0) continue
    const scores = scoreCandidate(request.mission, genome, prediction, validation)
    generated.push({ genome, prediction, validation, scores, summary: familySummary(genome, prediction) })
  }
  if (generated.length < 3) throw new Error('Generation constraints were too restrictive to produce three buildable aircraft.')
  return pickDiverse(generated)
}
