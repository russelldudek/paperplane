import type { AircraftFamily, AircraftGenome } from '../../domain/aircraft/genome'
import { validateGenome } from '../../domain/generation/validation'
import type { FlightBehavior } from '../../domain/experiments/diagnostics'
import type { FlightAttempt } from '../persistence/testRepository'

interface DesignPackageV1 {
  format: 'paper-airplane-lab-design'
  schemaVersion: 1
  exportedAt: string
  design: AircraftGenome
}

const families = new Set<AircraftFamily>([
  'narrow-dart', 'dart-glider', 'broad-glider', 'flying-wing',
  'accuracy-trainer', 'stunt-loop', 'payload-carrier',
])
const missions = new Set(['distance', 'airtime', 'accuracy', 'aerobatics', 'payload'])
const materials = new Set(['copy-75', 'copy-90', 'light-card-120'])
const behaviors = new Set<FlightBehavior>(['stable', 'stall', 'nose-dive', 'persistent-turn', 'spiral-dive', 'flutter', 'short-stable'])
const launchStyles = new Set<FlightAttempt['launchStyle']>(['gentle', 'standard', 'hard'])

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function finite(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function isGenome(value: unknown): value is AircraftGenome {
  if (!isRecord(value) || !isRecord(value.sheet) || !isRecord(value.geometry)) return false
  const geometry = value.geometry
  const geometryKeys = [
    'spanRatio', 'chordRatio', 'planformEfficiency', 'sweepDeg', 'dihedralDeg',
    'wingIncidenceDeg', 'noseMassFraction', 'controlTabDeg', 'verticalAreaRatio',
    'symmetryError', 'layerDragFactor',
  ]
  return value.schemaVersion === 1
    && typeof value.id === 'string' && value.id.length > 0
    && typeof value.name === 'string' && value.name.length > 0
    && families.has(value.family as AircraftFamily)
    && missions.has(String(value.mission))
    && finite(value.sheet.widthM) && finite(value.sheet.lengthM)
    && materials.has(String(value.materialId))
    && (value.constructionLevel === 1 || value.constructionLevel === 2)
    && finite(value.payloadMassG)
    && geometryKeys.every(key => finite(geometry[key]))
    && finite(value.foldComplexity) && finite(value.novelty)
    && value.modelVersion === '0.1.0'
    && value.calibrationVersion === 'baseline-2026-07'
}

export function serializeDesignPackage(design: AircraftGenome): string {
  const data: DesignPackageV1 = {
    format: 'paper-airplane-lab-design',
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    design,
  }
  return JSON.stringify(data, null, 2)
}

export function parseDesignPackage(source: string): AircraftGenome {
  let parsed: unknown
  try {
    parsed = JSON.parse(source)
  } catch {
    throw new Error('Invalid design package: the file is not valid JSON.')
  }
  if (!isRecord(parsed)
    || parsed.format !== 'paper-airplane-lab-design'
    || parsed.schemaVersion !== 1
    || !isGenome(parsed.design)) {
    throw new Error('Invalid design package: required versioned aircraft fields are missing or unsupported.')
  }
  const validation = validateGenome(parsed.design)
  if (!validation.valid) throw new Error(`Invalid design package: ${validation.errors.join(' ')}`)
  return structuredClone(parsed.design)
}

const csvHeaders = ['createdAt', 'distanceM', 'airtimeS', 'behavior', 'launchStyle', 'notes'] as const

function escapeCsv(value: string | number): string {
  const text = String(value)
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

export function serializeFlightAttemptsCsv(attempts: FlightAttempt[]): string {
  const lines = [csvHeaders.join(',')]
  for (const attempt of attempts) {
    lines.push([
      attempt.createdAt,
      attempt.distanceM,
      attempt.airtimeS,
      attempt.behavior,
      attempt.launchStyle,
      attempt.notes,
    ].map(escapeCsv).join(','))
  }
  return `${lines.join('\r\n')}\r\n`
}

function parseCsvRows(source: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let quoted = false

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index]
    if (quoted) {
      if (character === '"' && source[index + 1] === '"') {
        field += '"'
        index += 1
      } else if (character === '"') {
        quoted = false
      } else {
        field += character
      }
    } else if (character === '"') {
      quoted = true
    } else if (character === ',') {
      row.push(field)
      field = ''
    } else if (character === '\n') {
      row.push(field.replace(/\r$/, ''))
      if (row.some(value => value.length > 0)) rows.push(row)
      row = []
      field = ''
    } else {
      field += character
    }
  }
  if (quoted) throw new Error('Invalid CSV: an imported field has an unterminated quote.')
  row.push(field.replace(/\r$/, ''))
  if (row.some(value => value.length > 0)) rows.push(row)
  return rows
}

export type ImportedFlightAttempt = Omit<FlightAttempt, 'id' | 'schemaVersion' | 'createdAt'>

export function parseFlightAttemptsCsv(source: string, designId: string): ImportedFlightAttempt[] {
  const rows = parseCsvRows(source)
  if (!rows.length || csvHeaders.some((header, index) => rows[0][index] !== header)) {
    throw new Error(`Invalid flight-test CSV: expected headers ${csvHeaders.join(', ')}.`)
  }

  return rows.slice(1).map((row, index) => {
    const distanceM = Number(row[1])
    const airtimeS = Number(row[2])
    const behavior = row[3] as FlightBehavior
    const launchStyle = row[4] as FlightAttempt['launchStyle']
    if (!finite(distanceM) || distanceM < 0 || !finite(airtimeS) || airtimeS < 0
      || !behaviors.has(behavior) || !launchStyles.has(launchStyle)) {
      throw new Error(`Invalid flight-test CSV: row ${index + 2} contains unsupported values.`)
    }
    return { designId, distanceM, airtimeS, behavior, launchStyle, notes: row[5] ?? '' }
  })
}
