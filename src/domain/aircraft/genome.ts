import type { PaperMaterial } from '../materials/papers'
import type { ConstructionLevel, Mission } from '../shared/types'

export type AircraftFamily =
  | 'narrow-dart'
  | 'dart-glider'
  | 'broad-glider'
  | 'flying-wing'
  | 'accuracy-trainer'
  | 'stunt-loop'
  | 'payload-carrier'

export interface AircraftGeometry {
  spanRatio: number
  chordRatio: number
  planformEfficiency: number
  sweepDeg: number
  dihedralDeg: number
  wingIncidenceDeg: number
  noseMassFraction: number
  controlTabDeg: number
  verticalAreaRatio: number
  symmetryError: number
  layerDragFactor: number
}

export interface AircraftGenome {
  schemaVersion: 1
  id: string
  name: string
  family: AircraftFamily
  mission: Mission
  sheet: {
    widthM: number
    lengthM: number
  }
  materialId: PaperMaterial['id']
  constructionLevel: ConstructionLevel
  payloadMassG: number
  geometry: AircraftGeometry
  foldComplexity: number
  novelty: number
  modelVersion: '0.1.0'
  calibrationVersion: 'baseline-2026-07'
}
