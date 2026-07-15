import type { AircraftGenome } from '../../domain/aircraft/genome'
import type { Environment, LaunchProfile } from '../../domain/shared/types'

interface GeometryControlsProps {
  genome: AircraftGenome
  launch: LaunchProfile
  environment: Environment
  onGenomeChange: (genome: AircraftGenome) => void
  onLaunchChange: (launch: LaunchProfile) => void
  onEnvironmentChange: (environment: Environment) => void
}

interface NumberFieldProps {
  label: string
  value: number
  min: number
  max: number
  step: number
  unit: string
  onChange: (value: number) => void
}

function NumberField({ label, value, min, max, step, unit, onChange }: NumberFieldProps) {
  return (
    <label className="workbench-field">
      <span>{label}<small>{unit}</small></span>
      <input
        aria-label={label}
        type="number"
        min={min}
        max={max}
        step={step}
        value={Number.isFinite(value) ? value : ''}
        onChange={event => {
          const next = Number(event.target.value)
          if (Number.isFinite(next)) onChange(next)
        }}
      />
    </label>
  )
}

export function GeometryControls({ genome, launch, environment, onGenomeChange, onLaunchChange, onEnvironmentChange }: GeometryControlsProps) {
  const geometry = genome.geometry
  const patchGeometry = (patch: Partial<AircraftGenome['geometry']>) => onGenomeChange({ ...genome, geometry: { ...geometry, ...patch } })

  return (
    <div className="control-stack">
      <section className="control-group">
        <div className="control-group-title"><span>01</span><h3>Wing planform</h3></div>
        <div className="control-grid">
          <NumberField label="Span ratio" value={geometry.spanRatio} min={0.42} max={1} step={0.01} unit="sheet width" onChange={spanRatio => patchGeometry({ spanRatio })} />
          <NumberField label="Chord ratio" value={geometry.chordRatio} min={0.2} max={0.62} step={0.01} unit="sheet length" onChange={chordRatio => patchGeometry({ chordRatio })} />
          <NumberField label="Sweep angle" value={geometry.sweepDeg} min={8} max={56} step={1} unit="degrees" onChange={sweepDeg => patchGeometry({ sweepDeg })} />
          <NumberField label="Dihedral angle" value={geometry.dihedralDeg} min={-2} max={18} step={1} unit="degrees" onChange={dihedralDeg => patchGeometry({ dihedralDeg })} />
          <NumberField label="Wing incidence" value={geometry.wingIncidenceDeg} min={-1} max={7} step={0.2} unit="degrees" onChange={wingIncidenceDeg => patchGeometry({ wingIncidenceDeg })} />
          <NumberField label="Control tab" value={geometry.controlTabDeg} min={-8} max={10} step={0.5} unit="degrees" onChange={controlTabDeg => patchGeometry({ controlTabDeg })} />
        </div>
      </section>
      <section className="control-group">
        <div className="control-group-title"><span>02</span><h3>Mass & launch</h3></div>
        <div className="control-grid">
          <NumberField label="Nose mass fraction" value={geometry.noseMassFraction} min={0.1} max={0.34} step={0.01} unit="fraction" onChange={noseMassFraction => patchGeometry({ noseMassFraction })} />
          <NumberField label="Payload mass" value={genome.payloadMassG} min={0} max={20} step={1} unit="grams" onChange={payloadMassG => onGenomeChange({ ...genome, payloadMassG, constructionLevel: payloadMassG > 0 ? 2 : genome.constructionLevel })} />
          <NumberField label="Launch speed" value={launch.speedMps} min={3} max={18} step={0.5} unit="m/s" onChange={speedMps => onLaunchChange({ ...launch, speedMps })} />
          <NumberField label="Launch angle" value={launch.elevationDeg} min={-5} max={35} step={1} unit="degrees" onChange={elevationDeg => onLaunchChange({ ...launch, elevationDeg })} />
          <NumberField label="Release height" value={launch.releaseHeightM} min={0.5} max={2.5} step={0.05} unit="meters" onChange={releaseHeightM => onLaunchChange({ ...launch, releaseHeightM })} />
          <NumberField label="Wind speed" value={environment.windSpeedMps} min={0} max={8} step={0.5} unit="m/s" onChange={windSpeedMps => onEnvironmentChange({ ...environment, windSpeedMps, indoor: windSpeedMps === 0 })} />
        </div>
      </section>
    </div>
  )
}
