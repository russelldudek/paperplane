import { type ChangeEvent, type FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { Download, Plus, TestTube2, Upload } from 'lucide-react'
import { simulateFlight } from '../../domain/aerodynamics/model'
import type { AircraftGenome } from '../../domain/aircraft/genome'
import { diagnoseFlight, type DiagnosticRecommendation, type FlightBehavior } from '../../domain/experiments/diagnostics'
import { calmEnvironment, standardLaunch } from '../../domain/shared/types'
import { downloadTextFile, safeFilename } from '../../infrastructure/import-export/downloads'
import { parseFlightAttemptsCsv, serializeFlightAttemptsCsv } from '../../infrastructure/import-export/packages'
import type { FlightAttempt, TestRepository } from '../../infrastructure/persistence/testRepository'
import { DiagnosticPanel } from './DiagnosticPanel'

interface FlightLabProps { genome: AircraftGenome; repository: TestRepository }

export function FlightLab({ genome, repository }: FlightLabProps) {
  const prediction = useMemo(() => simulateFlight(genome, calmEnvironment, standardLaunch), [genome])
  const [attempts, setAttempts] = useState<FlightAttempt[]>([])
  const [diagnostic, setDiagnostic] = useState<DiagnosticRecommendation | null>(null)
  const [distanceM, setDistanceM] = useState(prediction.distanceM.nominal)
  const [airtimeS, setAirtimeS] = useState(prediction.airtimeS.nominal)
  const [behavior, setBehavior] = useState<FlightBehavior>('stable')
  const [launchStyle, setLaunchStyle] = useState<FlightAttempt['launchStyle']>('standard')
  const [notes, setNotes] = useState('')
  const [notice, setNotice] = useState('')

  const load = useCallback(() => repository.listByDesign(genome.id).then(setAttempts).catch(() => setAttempts([])), [genome.id, repository])
  useEffect(() => {
    void load()
  }, [load])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    try {
      await repository.save({ designId: genome.id, distanceM, airtimeS, behavior, launchStyle, notes })
      setDiagnostic(diagnoseFlight({ behavior }))
      setNotes('')
      setNotice('Throw saved locally.')
      await load()
    } catch {
      setNotice('The throw could not be saved.')
      setDiagnostic({ title: 'Session not saved', primaryAdjustment: 'Keep the measurement on paper and retry in a browser with local storage enabled.', rationale: 'This browser session did not provide IndexedDB access.', actions: ['Record the throw manually.'], caution: 'No data was written.' })
    }
  }

  const average = attempts.length ? {
    distance: attempts.reduce((sum, attempt) => sum + attempt.distanceM, 0) / attempts.length,
    airtime: attempts.reduce((sum, attempt) => sum + attempt.airtimeS, 0) / attempts.length,
  } : null

  const exportAttempts = () => {
    downloadTextFile(`${safeFilename(genome.name)}-flight-tests.csv`, serializeFlightAttemptsCsv(attempts), 'text/csv')
    setNotice(`Exported ${attempts.length} flight ${attempts.length === 1 ? 'attempt' : 'attempts'}.`)
  }

  const importAttempts = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    try {
      const imported = parseFlightAttemptsCsv(await file.text(), genome.id)
      for (const attempt of imported) await repository.save(attempt)
      await load()
      setNotice(`Imported ${imported.length} flight ${imported.length === 1 ? 'attempt' : 'attempts'}.`)
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Unable to import that flight-test CSV.')
    }
  }

  return (
    <div className="flight-lab-page">
      <header className="feature-header"><div><span>Flight Test Lab</span><h1>{genome.name}</h1><p>Compare measured throws with the nominal model, then change only one variable on the next test.</p></div><div className="feature-actions"><label className="secondary-action file-action"><Upload size={16} /> Import CSV<input accept=".csv,text/csv" type="file" onChange={importAttempts} /></label><button className="secondary-action" type="button" disabled={!attempts.length} onClick={exportAttempts}><Download size={16} /> Export CSV</button></div></header>
      {notice ? <div className="inline-notice" role="status">{notice}</div> : null}
      <div className="flight-lab-layout">
        <form className="test-form" onSubmit={submit}>
          <div className="form-title"><TestTube2 size={22} /><div><strong>Record a throw</strong><span>Predicted {prediction.distanceM.nominal} m · {prediction.airtimeS.nominal} s</span></div></div>
          <div className="field-grid">
            <label className="field-label">Distance (m)<input type="number" step="0.1" min="0" value={distanceM} onChange={event => setDistanceM(Number(event.target.value))} /></label>
            <label className="field-label">Airtime (s)<input type="number" step="0.1" min="0" value={airtimeS} onChange={event => setAirtimeS(Number(event.target.value))} /></label>
            <label className="field-label">Observed behavior<select value={behavior} onChange={event => setBehavior(event.target.value as FlightBehavior)}><option value="stable">Stable</option><option value="stall">Climb then stall</option><option value="nose-dive">Nose dive</option><option value="persistent-turn">Persistent turn</option><option value="spiral-dive">Spiral dive</option><option value="flutter">Flutter</option><option value="short-stable">Short but stable</option></select></label>
            <label className="field-label">Launch style<select value={launchStyle} onChange={event => setLaunchStyle(event.target.value as FlightAttempt['launchStyle'])}><option value="gentle">Gentle</option><option value="standard">Standard</option><option value="hard">Hard</option></select></label>
          </div>
          <label className="field-label">Notes<textarea rows={4} value={notes} onChange={event => setNotes(event.target.value)} placeholder="Wind, launch angle, trim, damage, or anything unusual" /></label>
          <button className="primary-action" type="submit"><Plus size={17} /> Save throw & diagnose</button>
        </form>
        <section className="test-results">
          <div className="result-comparison"><div><span>Predicted distance</span><strong>{prediction.distanceM.nominal} m</strong></div><div><span>Measured average</span><strong>{average ? average.distance.toFixed(1) : '—'} m</strong></div><div><span>Predicted airtime</span><strong>{prediction.airtimeS.nominal} s</strong></div><div><span>Measured average</span><strong>{average ? average.airtime.toFixed(1) : '—'} s</strong></div></div>
          {diagnostic ? <DiagnosticPanel recommendation={diagnostic} /> : <div className="empty-state compact"><TestTube2 size={30} /><strong>Record a throw to receive a bounded trim recommendation.</strong></div>}
          <div className="attempt-list"><h2>Recent throws</h2>{attempts.slice(0, 8).map((attempt, index) => <div className="attempt-row" key={attempt.id}><strong>#{attempts.length - index}</strong><span>{attempt.distanceM} m</span><span>{attempt.airtimeS} s</span><span>{attempt.behavior.replaceAll('-', ' ')}</span></div>)}</div>
        </section>
      </div>
    </div>
  )
}
