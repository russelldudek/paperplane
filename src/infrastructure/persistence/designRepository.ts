import type { AircraftGenome } from '../../domain/aircraft/genome'
import { deleteRecord, getAllRecords, putRecord } from './database'

export interface SavedDesign {
  id: string
  schemaVersion: 1
  genome: AircraftGenome
  createdAt: string
  updatedAt: string
}

export interface DesignRepository {
  save(genome: AircraftGenome): Promise<SavedDesign>
  list(): Promise<SavedDesign[]>
  delete(id: string): Promise<void>
}

export class IndexedDbDesignRepository implements DesignRepository {
  async save(genome: AircraftGenome): Promise<SavedDesign> {
    const existing = (await this.list()).find(item => item.id === genome.id)
    const now = new Date().toISOString()
    const record: SavedDesign = {
      id: genome.id,
      schemaVersion: 1,
      genome,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    }
    await putRecord('designs', record)
    return record
  }

  async list(): Promise<SavedDesign[]> {
    const records = await getAllRecords<SavedDesign>('designs')
    return [...records].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  }

  delete(id: string): Promise<void> {
    return deleteRecord('designs', id)
  }
}
