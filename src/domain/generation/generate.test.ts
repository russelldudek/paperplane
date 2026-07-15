import { generateCandidates } from './generate'

describe('hybrid paper airplane generator', () => {
  it('is reproducible, diverse, and returns only valid candidates', () => {
    const request = { mission: 'distance' as const, seed: 31415, learner: 'engineer' as const }
    const first = generateCandidates(request)
    const second = generateCandidates(request)

    expect(first).toEqual(second)
    expect(first).toHaveLength(3)
    expect(new Set(first.map(item => item.genome.family)).size).toBeGreaterThan(1)
    expect(first.every(item => item.validation.valid)).toBe(true)
  })

  it('respects a requested payload when evaluating payload aircraft', () => {
    const candidates = generateCandidates({ mission: 'payload', seed: 9, learner: 'maker', payloadMassG: 8 })
    expect(candidates.every(candidate => candidate.genome.payloadMassG === 8)).toBe(true)
    expect(candidates[0].prediction.payloadMarginG).toBeGreaterThanOrEqual(0)
  })
})
