import type { LearnerProfile } from '../shared/types'
export function instructionVerb(learner: LearnerProfile, simple: string, technical: string): string { return learner === 'engineer' || learner === 'advanced' || learner === 'maker' ? technical : simple }
