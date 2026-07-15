import type { AircraftGenome } from '../aircraft/genome'
import { clamp, round } from '../shared/math'
import type { SeededRandom } from './random'

export interface MutationIntensity { geometry: number; novelty: number; complexity: number }

export function mutateGenome(parent: AircraftGenome, random: SeededRandom, intensity: MutationIntensity, index: number): AircraftGenome {
  const vary = (value: number, spread: number, min: number, max: number) => round(clamp(value + random.between(-spread, spread) * intensity.geometry, min, max), 4)
  const adjective = ['Vector', 'Nimbus', 'Kestrel', 'Aero', 'Orbit', 'Atlas', 'Vela'][Math.floor(random.next() * 7)]
  const suffix = String(101 + ((Math.abs(Math.trunc(random.next() * 899)) + index * 17) % 899))
  return {
    ...parent,
    id: `${parent.family}-${index}-${suffix}`,
    name: `${adjective} ${suffix}`,
    geometry: {
      ...parent.geometry,
      spanRatio: vary(parent.geometry.spanRatio, 0.13, 0.42, 1),
      chordRatio: vary(parent.geometry.chordRatio, 0.09, 0.2, 0.62),
      planformEfficiency: vary(parent.geometry.planformEfficiency, 0.08, 0.5, 0.92),
      sweepDeg: vary(parent.geometry.sweepDeg, 9, 8, 56),
      dihedralDeg: vary(parent.geometry.dihedralDeg, 4.5, -2, 18),
      wingIncidenceDeg: vary(parent.geometry.wingIncidenceDeg, 1.6, -1, 7),
      noseMassFraction: vary(parent.geometry.noseMassFraction, 0.055, 0.1, 0.34),
      controlTabDeg: vary(parent.geometry.controlTabDeg, 3.2, -8, 10),
      verticalAreaRatio: vary(parent.geometry.verticalAreaRatio, 0.04, 0.01, 0.2),
      symmetryError: vary(parent.geometry.symmetryError, 0.012, 0.002, 0.05),
      layerDragFactor: vary(parent.geometry.layerDragFactor, 0.05, 0.04, 0.28),
    },
    foldComplexity: vary(parent.foldComplexity, 0.16 * intensity.complexity, 0.24, 0.86),
    novelty: round(clamp(parent.novelty + random.between(0.15, 0.7) * intensity.novelty, 0, 1), 3),
  }
}
