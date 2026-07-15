import { createFamilyGenome } from '../../domain/aircraft/families'
import type { FlightAttempt } from '../persistence/testRepository'
import { parseDesignPackage, parseFlightAttemptsCsv, serializeDesignPackage, serializeFlightAttemptsCsv } from './packages'

describe('portable laboratory packages', () => {
  it('round-trips a versioned aircraft genome without information loss', () => {
    const genome = createFamilyGenome('broad-glider')
    const encoded = serializeDesignPackage(genome)
    expect(parseDesignPackage(encoded)).toEqual(genome)
  })

  it('round-trips a light-card payload carrier package', () => {
    const genome = createFamilyGenome('payload-carrier')
    const encoded = serializeDesignPackage(genome)
    expect(parseDesignPackage(encoded)).toEqual(genome)
  })

  it('rejects executable or structurally invalid JSON instead of trusting imported values', () => {
    expect(() => parseDesignPackage('{"schemaVersion":1,"design":{"name":"broken"}}')).toThrow(/invalid/i)
  })

  it('exports and imports flight attempts as quoted CSV', () => {
    const attempts: FlightAttempt[] = [{
      id: 'attempt-1', schemaVersion: 1, designId: 'plane-1', createdAt: '2026-07-14T12:00:00.000Z',
      distanceM: 12.4, airtimeS: 2.7, behavior: 'persistent-turn', launchStyle: 'standard',
      notes: 'Light crosswind, landed near "target"',
    }]
    const csv = serializeFlightAttemptsCsv(attempts)
    const parsed = parseFlightAttemptsCsv(csv, 'plane-1')
    expect(parsed).toHaveLength(1)
    expect(parsed[0].notes).toBe(attempts[0].notes)
    expect(parsed[0].behavior).toBe('persistent-turn')
  })
})
