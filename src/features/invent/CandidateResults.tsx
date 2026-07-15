import { ArrowRight, Save, ShieldCheck, Sparkles, Wrench } from 'lucide-react'
import type { GeneratedCandidate } from '../../domain/generation/generate'
import { RangeMetric } from '../../ui/RangeMetric'
import { StatusMeter } from '../../ui/StatusMeter'
import { AircraftSilhouette } from './AircraftSilhouette'

const roleLabels = {
  'best-match': { label: 'Best match', icon: ShieldCheck },
  'easiest-build': { label: 'Easiest build', icon: Wrench },
  experimental: { label: 'Experimental', icon: Sparkles },
}

interface CandidateResultsProps {
  candidates: GeneratedCandidate[]
  onSelect: (candidate: GeneratedCandidate) => void
}

export function CandidateResults({ candidates, onSelect }: CandidateResultsProps) {
  return (
    <section className="candidate-section" aria-labelledby="candidate-title">
      <div className="section-heading-row">
        <div><span className="section-number">02</span><h2 id="candidate-title">Candidate aircraft</h2></div>
        <p>Three different trade-offs, all inside the current physics and construction constraints.</p>
      </div>
      <div className="candidate-grid">
        {candidates.map(candidate => {
          const role = roleLabels[candidate.role]
          const RoleIcon = role.icon
          return (
            <article className="candidate-card" data-testid="candidate-card" key={candidate.genome.id}>
              <div className="candidate-card-head">
                <span className={`role-label ${candidate.role}`}><RoleIcon size={14} /> {role.label}</span>
                <span className={`confidence confidence-${candidate.prediction.confidence}`}>{candidate.prediction.confidence} confidence</span>
              </div>
              <AircraftSilhouette genome={candidate.genome} />
              <div className="candidate-title-row">
                <div><h3>{candidate.genome.name}</h3><span>{candidate.genome.family.replaceAll('-', ' ')}</span></div>
                <strong>{candidate.scores.total}</strong>
              </div>
              <p className="candidate-summary">{candidate.summary}</p>
              <div className="candidate-metrics">
                <RangeMetric label="Distance" range={candidate.prediction.distanceM} unit="m" />
                <RangeMetric label="Airtime" range={candidate.prediction.airtimeS} unit="s" />
              </div>
              <StatusMeter label="Stability" value={candidate.prediction.stabilityScore} detail={`Static margin ${candidate.prediction.staticMarginPercent}%`} />
              <div className="candidate-footer">
                <span>{Math.round(candidate.genome.foldComplexity * 10)} / 10 fold difficulty</span>
                <button type="button" onClick={() => onSelect(candidate)}><Save size={16} /> Select design <ArrowRight size={16} /></button>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
