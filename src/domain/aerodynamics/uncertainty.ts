import type { AircraftGenome } from '../aircraft/genome'
import type { Environment, LaunchProfile } from '../shared/types'
import { clamp } from '../shared/math'

export function estimateRelativeUncertainty(
  genome: AircraftGenome,
  environment: Environment,
  launch: LaunchProfile,
): number {
  const construction = 0.04 + genome.foldComplexity * 0.055
  const alignment = genome.geometry.symmetryError * 2.5
  const launchSpread = launch.repeatability * 0.7
  const wind = environment.windSpeedMps * 0.018 + (environment.gustiness === 'gusty' ? 0.08 : environment.gustiness === 'light' ? 0.03 : 0)
  const experimental = genome.mission === 'aerobatics' ? 0.12 : genome.mission === 'payload' ? 0.07 : 0
  return clamp(construction + alignment + launchSpread + wind + experimental, 0.08, 0.34)
}
