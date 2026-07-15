export type FlightBehavior = 'stable' | 'stall' | 'nose-dive' | 'persistent-turn' | 'spiral-dive' | 'flutter' | 'short-stable'

export interface FlightObservation {
  behavior: FlightBehavior
}

export interface DiagnosticRecommendation {
  title: string
  primaryAdjustment: string
  rationale: string
  actions: [string]
  caution: string
}

const recommendations: Record<FlightBehavior, DiagnosticRecommendation> = {
  stable: {
    title: 'Stable baseline',
    primaryAdjustment: 'Keep the current trim and repeat the same launch three times.',
    rationale: 'A stable baseline is more valuable than immediately chasing extra distance.',
    actions: ['Repeat the throw without changing the aircraft.'],
    caution: 'Only change a variable after you have a repeatable baseline.',
  },
  stall: {
    title: 'Reduce excess nose-up tendency',
    primaryAdjustment: 'Flatten the elevator-up trim by about 1 mm, or lower the launch angle before moving the center of gravity.',
    rationale: 'A steep climb followed by a drop indicates the aircraft exceeded its usable angle of attack.',
    actions: ['Flatten both trailing-edge tabs equally by approximately 1 mm.'],
    caution: 'Do not make an elevator and center-of-gravity change on the same trial.',
  },
  'nose-dive': {
    title: 'Add a small pitch-up correction',
    primaryAdjustment: 'Raise both elevator tabs by about 1 mm before shifting the center of gravity aft.',
    rationale: 'A consistent nose dive indicates excessive nose-down moment or insufficient wing incidence.',
    actions: ['Raise both trailing-edge tabs equally by approximately 1 mm.'],
    caution: 'Stop before the correction produces a climb-and-stall cycle.',
  },
  'persistent-turn': {
    title: 'Restore symmetry first',
    primaryAdjustment: 'Check wing symmetry and equal dihedral before adding a tiny rudder correction.',
    rationale: 'Most persistent turns in paper aircraft come from unequal folds, twist, or asymmetric wing angles.',
    actions: ['Place the aircraft on a table and equalize the left and right wing-tip heights.'],
    caution: 'Avoid counter-bending several surfaces at once.',
  },
  'spiral-dive': {
    title: 'Increase roll stability',
    primaryAdjustment: 'Increase equal dihedral slightly and remove large control deflections.',
    rationale: 'A tightening bank indicates insufficient roll restoring tendency or excessive asymmetric control input.',
    actions: ['Raise both wing tips by the same small amount.'],
    caution: 'Inspect for a twisted fuselage before changing trim.',
  },
  flutter: {
    title: 'Stiffen the flexible surface',
    primaryAdjustment: 'Shorten or reinforce the fluttering edge and reduce launch speed for the next test.',
    rationale: 'Flutter wastes launch energy and can destabilize pitch and roll.',
    actions: ['Add one small removable tape bridge across the flexible crease.'],
    caution: 'Tape changes mass as well as stiffness; record its placement.',
  },
  'short-stable': {
    title: 'Protect launch energy',
    primaryAdjustment: 'Inspect exposed folds and alignment before increasing launch speed.',
    rationale: 'A short but stable flight usually points to drag, high wing loading, or a launch that is too slow.',
    actions: ['Press the leading-edge and nose folds flat to reduce exposed steps.'],
    caution: 'Do not throw harder until the aircraft is structurally flat and symmetric.',
  },
}

export function diagnoseFlight(observation: FlightObservation): DiagnosticRecommendation {
  return recommendations[observation.behavior]
}
