import { diagnoseFlight } from './diagnostics'

describe('flight diagnostics', () => {
  it('recommends one bounded correction for a stall', () => {
    const result = diagnoseFlight({ behavior: 'stall' })
    expect(result.primaryAdjustment).toMatch(/elevator|launch angle|center of gravity/i)
    expect(result.actions).toHaveLength(1)
  })

  it('checks symmetry first for a persistent turn', () => {
    const result = diagnoseFlight({ behavior: 'persistent-turn' })
    expect(result.primaryAdjustment).toMatch(/symmetry|dihedral|rudder/i)
  })
})
