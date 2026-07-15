import { useState } from 'react'
import { ArrowDown, Atom, RefreshCw } from 'lucide-react'
import { generateCandidates, type GeneratedCandidate } from '../../domain/generation/generate'
import { calmEnvironment, type Mission } from '../../domain/shared/types'
import { CandidateResults } from './CandidateResults'
import { ConstraintPanel, type InventConstraints } from './ConstraintPanel'
import { MissionSelector } from './MissionSelector'

interface InventLabProps {
  onSelectCandidate: (candidate: GeneratedCandidate) => void
}

const initialConstraints: InventConstraints = {
  learner: 'investigator',
  paperId: 'copy-90',
  difficulty: 'balanced',
  environment: 'indoor',
  payloadMassG: 6,
}

export function InventLab({ onSelectCandidate }: InventLabProps) {
  const [mission, setMission] = useState<Mission>('distance')
  const [constraints, setConstraints] = useState(initialConstraints)
  const [seed, setSeed] = useState(31415)
  const [candidates, setCandidates] = useState<GeneratedCandidate[]>([])

  const generate = () => {
    const environment = constraints.environment === 'indoor'
      ? calmEnvironment
      : { ...calmEnvironment, indoor: false, windSpeedMps: 1.8, gustiness: 'light' as const }
    setCandidates(generateCandidates({
      mission,
      learner: constraints.learner,
      paperId: constraints.paperId,
      difficulty: constraints.difficulty,
      payloadMassG: mission === 'payload' ? constraints.payloadMassG : 0,
      constructionLevel: mission === 'payload' ? 2 : 1,
      environment,
      seed,
    }))
  }

  return (
    <div className="invent-lab">
      <section className="invent-intro">
        <div>
          <span className="eyebrow-free-icon"><Atom size={18} /></span>
          <h1><span className="sr-only">Paper Airplane Lab — </span>Choose a mission.<br />Let physics shape the plane.</h1>
          <p>The generator evolves proven aircraft families, checks their geometry and stability, then shows the assumptions and uncertainty behind every prediction.</p>
        </div>
        <div className="model-note">
          <strong>Model honesty</strong>
          <p>This is a calibrated reduced-order model—not computational fluid dynamics. Real throws are part of the experiment.</p>
        </div>
      </section>

      <section className="invent-config" aria-labelledby="mission-heading">
        <div className="section-heading-row">
          <div><span className="section-number">01</span><h2 id="mission-heading">Define the flight</h2></div>
          <p>Pick the goal first. The generator changes geometry, stability, and fold complexity around that mission.</p>
        </div>
        <MissionSelector value={mission} onChange={setMission} />
        <ConstraintPanel mission={mission} value={constraints} onChange={setConstraints} />
        <div className="generate-row">
          <button className="primary-action generate-action" type="button" onClick={generate}>
            {candidates.length ? <RefreshCw size={18} /> : <ArrowDown size={18} />}
            Generate Aircraft
          </button>
          <button className="seed-button" type="button" onClick={() => setSeed(previous => previous + 97)}>Seed {seed} · change</button>
        </div>
      </section>

      {candidates.length ? <CandidateResults candidates={candidates} onSelect={onSelectCandidate} /> : null}
    </div>
  )
}
