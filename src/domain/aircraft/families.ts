import type { AircraftFamily, AircraftGenome } from './genome'

interface FamilyTemplate {
  name: string
  mission: AircraftGenome['mission']
  materialId: AircraftGenome['materialId']
  foldComplexity: number
  geometry: AircraftGenome['geometry']
}

const familyTemplates: Record<AircraftFamily, FamilyTemplate> = {
  'narrow-dart': {
    name: 'Needle Dart',
    mission: 'distance',
    materialId: 'copy-90',
    foldComplexity: 0.42,
    geometry: { spanRatio: 0.58, chordRatio: 0.48, planformEfficiency: 0.62, sweepDeg: 48, dihedralDeg: 4, wingIncidenceDeg: 1.2, noseMassFraction: 0.27, controlTabDeg: 0.5, verticalAreaRatio: 0.08, symmetryError: 0.012, layerDragFactor: 0.18 },
  },
  'dart-glider': {
    name: 'Arrowwing Hybrid',
    mission: 'distance',
    materialId: 'copy-90',
    foldComplexity: 0.52,
    geometry: { spanRatio: 0.74, chordRatio: 0.41, planformEfficiency: 0.69, sweepDeg: 34, dihedralDeg: 6, wingIncidenceDeg: 2.2, noseMassFraction: 0.22, controlTabDeg: 1.3, verticalAreaRatio: 0.09, symmetryError: 0.01, layerDragFactor: 0.14 },
  },
  'broad-glider': {
    name: 'Cloud Skimmer',
    mission: 'airtime',
    materialId: 'copy-75',
    foldComplexity: 0.46,
    geometry: { spanRatio: 0.92, chordRatio: 0.32, planformEfficiency: 0.83, sweepDeg: 18, dihedralDeg: 9, wingIncidenceDeg: 3.6, noseMassFraction: 0.17, controlTabDeg: 2.2, verticalAreaRatio: 0.07, symmetryError: 0.008, layerDragFactor: 0.09 },
  },
  'flying-wing': {
    name: 'Manta Wing',
    mission: 'airtime',
    materialId: 'copy-90',
    foldComplexity: 0.68,
    geometry: { spanRatio: 0.97, chordRatio: 0.38, planformEfficiency: 0.86, sweepDeg: 28, dihedralDeg: 2, wingIncidenceDeg: 1.8, noseMassFraction: 0.18, controlTabDeg: 3.4, verticalAreaRatio: 0.03, symmetryError: 0.009, layerDragFactor: 0.11 },
  },
  'accuracy-trainer': {
    name: 'True Track',
    mission: 'accuracy',
    materialId: 'copy-90',
    foldComplexity: 0.38,
    geometry: { spanRatio: 0.76, chordRatio: 0.39, planformEfficiency: 0.75, sweepDeg: 24, dihedralDeg: 11, wingIncidenceDeg: 2.4, noseMassFraction: 0.23, controlTabDeg: 0.8, verticalAreaRatio: 0.13, symmetryError: 0.006, layerDragFactor: 0.12 },
  },
  'stunt-loop': {
    name: 'Loop Fox',
    mission: 'aerobatics',
    materialId: 'copy-75',
    foldComplexity: 0.6,
    geometry: { spanRatio: 0.7, chordRatio: 0.4, planformEfficiency: 0.71, sweepDeg: 25, dihedralDeg: 1, wingIncidenceDeg: 4.2, noseMassFraction: 0.15, controlTabDeg: 8, verticalAreaRatio: 0.08, symmetryError: 0.018, layerDragFactor: 0.13 },
  },
  'payload-carrier': {
    name: 'Cargo Crane',
    mission: 'payload',
    materialId: 'light-card-120',
    foldComplexity: 0.73,
    geometry: { spanRatio: 0.9, chordRatio: 0.43, planformEfficiency: 0.78, sweepDeg: 19, dihedralDeg: 10, wingIncidenceDeg: 3, noseMassFraction: 0.24, controlTabDeg: 1.8, verticalAreaRatio: 0.12, symmetryError: 0.01, layerDragFactor: 0.19 },
  },
}

export const aircraftFamilies = Object.keys(familyTemplates) as AircraftFamily[]

export function createFamilyGenome(family: AircraftFamily): AircraftGenome {
  const template = familyTemplates[family]
  return {
    schemaVersion: 1,
    id: `${family}-baseline`,
    name: template.name,
    family,
    mission: template.mission,
    sheet: { widthM: 0.216, lengthM: 0.279 },
    materialId: template.materialId,
    constructionLevel: 1,
    payloadMassG: 0,
    geometry: { ...template.geometry },
    foldComplexity: template.foldComplexity,
    novelty: 0,
    modelVersion: '0.1.0',
    calibrationVersion: 'baseline-2026-07',
  }
}
