import type { FlightBehavior } from '../../domain/experiments/diagnostics'
import { getAllRecords, putRecord } from './database'

export interface FlightAttempt {
  id: string
  schemaVersion: 1
  designId: string
  createdAt: string
  distanceM: number
  airtimeS: number
  behavior: FlightBehavior
  launchStyle: 'gentle' | 'standard' | 'hard'
  notes: string
}

export interface TestRepository {
  save(attempt: Omit<FlightAttempt, 'id' | 'schemaVersion' | 'createdAt'>): Promise<FlightAttempt>
  listByDesign(designId: string): Promise<FlightAttempt[]>
}

export class IndexedDbTestRepository implements TestRepository {
  async save(attempt: Omit<FlightAttempt, 'id' | 'schemaVersion' | 'createdAt'>): Promise<FlightAttempt> {
    const record: FlightAttempt = {
      ...attempt,
      id: `${attempt.designId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      schemaVersion: 1,
      createdAt: new Date().toISOString(),
    }
    await putRecord('attempts', record)
    return record
  }

  async listByDesign(designId: string): Promise<FlightAttempt[]> {
    const records = await getAllRecords<FlightAttempt>('attempts')
    return records.filter(record => record.designId === designId).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }
}
