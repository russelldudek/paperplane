import { createFamilyGenome } from '../aircraft/families'
import { buildInstructionSet } from './folds'

describe('fold instruction generation', () => {
  it('creates a complete structured sequence for a narrow dart', () => {
    const instructions = buildInstructionSet(createFamilyGenome('narrow-dart'), 'investigator')
    expect(instructions.steps.length).toBeGreaterThanOrEqual(6)
    expect(instructions.steps.every(step => step.crease && step.instruction)).toBe(true)
    expect(instructions.steps.at(-1)?.checkpoint).toMatch(/ready|flight/i)
  })
})
