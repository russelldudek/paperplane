import { useMemo, useState } from 'react'
import { Download, RotateCcw, Save } from 'lucide-react'
import { simulateFlight } from '../../domain/aerodynamics/model'
import type { AircraftGenome } from '../../domain/aircraft/genome'
import { calmEnvironment, standardLaunch } from '../../domain/shared/types'
import { validateGenome } from '../../domain/generation/validation'
import { downloadTextFile, safeFilename } from '../../infrastructure/import-export/downloads'
import { serializeDesignPackage } from '../../infrastructure/import-export/packages'
import { AircraftSilhouette } from '../invent/AircraftSilhouette'
import { GeometryControls } from './GeometryControls'
import { PredictionPanel } from './PredictionPanel'
import { TrajectoryPlot } from './TrajectoryPlot'

interface EngineeringWorkbenchProps {
  initialGenome: AircraftGenome
  onGenomeChange: (genome: AircraftGenome) => void
  onSave?: (genome: AircraftGenome) => void | Promise<unknown>
}

export function EngineeringWorkbench({ initialGenome, onGenomeChange, onSave }: EngineeringWorkbenchProps) {
  const [baseline] = useState(initialGenome)
  const [genome, setGenome] = useState(initialGenome)
  const [launch, setLaunch] = useState(standardLaunch)
  const [environment, setEnvironment] = useState(calmEnvironment)
  const [saveStatus, setSaveStatus] = useState('')


  const prediction = useMemo(() => simulateFlight(genome, environment, launch), [genome, environment, launch])
  const validation = useMemo(() => validateGenome(genome), [genome])

  const updateGenome = (next: AircraftGenome) => {
    setGenome(next)
    setSaveStatus('')
    onGenomeChange(next)
  }

  const save = async () => {
    try {
      await onSave?.(genome)
      setSaveStatus('Revision saved to the local Hangar.')
    } catch {
      setSaveStatus('This browser could not save the revision locally.')
    }
  }

  const exportDesign = () => {
    downloadTextFile(`${safeFilename(genome.name)}.paperplane.json`, serializeDesignPackage(genome), 'application/json')
    setSaveStatus('Versioned design package exported.')
  }

  return (
    <div className="workbench-page">
      <header className="feature-header">
        <div><span>Engineering Workbench</span><h1>{genome.name}</h1><p>Change one variable at a time and watch the model respond. Red warnings are hard constraints; amber notes identify sensitivity.</p></div>
        <div className="feature-actions">
          <button className="secondary-action" type="button" onClick={() => updateGenome(baseline)}><RotateCcw size={17} /> Reset</button>
          <button className="secondary-action" type="button" onClick={exportDesign}><Download size={17} /> Export JSON</button><button className="primary-action" type="button" onClick={() => void save()}><Save size={17} /> Save revision</button>
        </div>
      </header>
      {saveStatus ? <div className="inline-notice" role="status">{saveStatus}</div> : null}
      <div className="workbench-layout">
        <aside className="workbench-controls"><GeometryControls genome={genome} launch={launch} environment={environment} onGenomeChange={updateGenome} onLaunchChange={setLaunch} onEnvironmentChange={setEnvironment} /></aside>
        <section className="workbench-canvas">
          <div className="design-canvas-head"><div><span>Top view</span><strong>{genome.family.replaceAll('-', ' ')}</strong></div><div><span>Paper</span><strong>{genome.materialId}</strong></div></div>
          <AircraftSilhouette genome={genome} />
          <TrajectoryPlot prediction={prediction} launch={launch} />
        </section>
        <aside className="workbench-predictions"><PredictionPanel prediction={prediction} warnings={[...validation.errors, ...validation.warnings]} /></aside>
      </div>
    </div>
  )
}
