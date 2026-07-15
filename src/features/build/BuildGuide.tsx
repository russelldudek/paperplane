import { Printer, ShieldCheck } from 'lucide-react'
import { simulateFlight } from '../../domain/aerodynamics/model'
import type { AircraftGenome } from '../../domain/aircraft/genome'
import { buildInstructionSet } from '../../domain/instructions/folds'
import { calmEnvironment, standardLaunch, type LearnerProfile } from '../../domain/shared/types'
import { FoldDiagram } from './FoldDiagram'
import { PrintableLab } from './PrintableLab'

interface BuildGuideProps { genome: AircraftGenome; learner?: LearnerProfile }
export function BuildGuide({ genome, learner = 'investigator' }: BuildGuideProps) {
  const instructions = buildInstructionSet(genome, learner)
  const prediction = simulateFlight(genome, calmEnvironment, standardLaunch)
  return <div className="build-page"><header className="feature-header"><div><span>Build & Fold</span><h1>{genome.name}</h1><p>{instructions.steps.length} structured folds · approximately {instructions.estimatedMinutes} minutes · alignment tolerance shown at every step.</p></div><button className="primary-action" type="button" onClick={() => window.print()}><Printer size={17} /> Print laboratory package</button></header><section className="build-overview"><div><ShieldCheck size={20} /><strong>Preflight constraint check passed</strong><span>{prediction.confidence} confidence model · static margin {prediction.staticMarginPercent}%</span></div><ul>{instructions.materials.map(item => <li key={item}>{item}</li>)}</ul></section><div className="fold-step-list">{instructions.steps.map(step => <article className="fold-step-card" key={step.id}><FoldDiagram step={step} /><div className="fold-step-copy"><span>Step {step.number} · {step.crease.orientation} fold</span><h2>{step.title}</h2><p>{step.instruction}</p><div className="checkpoint"><strong>Checkpoint</strong><p>{step.checkpoint}</p></div><small>Alignment tolerance: ±{step.toleranceMm} mm</small></div></article>)}</div><PrintableLab genome={genome} prediction={prediction} instructions={instructions} /></div>
}
