import type { LearnerProfile, Mission } from '../../domain/shared/types'
import type { PaperMaterial } from '../../domain/materials/papers'
import { SegmentedControl } from '../../ui/SegmentedControl'

export interface InventConstraints {
  learner: LearnerProfile
  paperId: PaperMaterial['id']
  difficulty: 'easy' | 'balanced' | 'challenging'
  environment: 'indoor' | 'outdoor'
  payloadMassG: number
}

interface ConstraintPanelProps {
  mission: Mission
  value: InventConstraints
  onChange: (value: InventConstraints) => void
}

export function ConstraintPanel({ mission, value, onChange }: ConstraintPanelProps) {
  const patch = <K extends keyof InventConstraints>(key: K, next: InventConstraints[K]) => onChange({ ...value, [key]: next })
  return (
    <div className="constraint-panel">
      <div className="field-grid">
        <label className="field-label">
          Learner level
          <select value={value.learner} onChange={event => patch('learner', event.target.value as LearnerProfile)}>
            <option value="explorer">Explorer · grades 3–5</option>
            <option value="investigator">Investigator · grades 6–8</option>
            <option value="engineer">Engineer · high school</option>
            <option value="maker">Maker · hobbyist</option>
            <option value="advanced">Advanced</option>
          </select>
        </label>
        <label className="field-label">
          Paper
          <select value={value.paperId} onChange={event => patch('paperId', event.target.value as PaperMaterial['id'])}>
            <option value="copy-75">75 gsm light copy paper</option>
            <option value="copy-90">90 gsm premium copy paper</option>
            <option value="light-card-120">120 gsm light cardstock</option>
          </select>
        </label>
      </div>
      <SegmentedControl
        label="Folding challenge"
        value={value.difficulty}
        onChange={next => patch('difficulty', next)}
        options={[
          { value: 'easy', label: 'Easy' },
          { value: 'balanced', label: 'Balanced' },
          { value: 'challenging', label: 'Challenging' },
        ]}
      />
      <SegmentedControl
        label="Test environment"
        value={value.environment}
        onChange={next => patch('environment', next)}
        options={[{ value: 'indoor', label: 'Indoor' }, { value: 'outdoor', label: 'Outdoor' }]}
      />
      {mission === 'payload' ? (
        <label className="field-label range-field">
          Payload mass <strong>{value.payloadMassG} g</strong>
          <input aria-label="Payload mass" type="range" min="1" max="16" step="1" value={value.payloadMassG} onChange={event => patch('payloadMassG', Number(event.target.value))} />
        </label>
      ) : null}
    </div>
  )
}
