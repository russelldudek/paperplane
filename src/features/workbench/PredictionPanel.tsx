import type { FlightPrediction } from '../../domain/aerodynamics/model'
import { RangeMetric } from '../../ui/RangeMetric'
import { StatusMeter } from '../../ui/StatusMeter'

interface PredictionPanelProps {
  prediction: FlightPrediction
  warnings: string[]
}

export function PredictionPanel({ prediction, warnings }: PredictionPanelProps) {
  return (
    <div className="prediction-stack">
      <section className="prediction-summary">
        <div className="prediction-confidence"><span className={`status-dot confidence-dot-${prediction.confidence}`} /><strong>{prediction.confidence} confidence</strong><small>±{Math.round(prediction.uncertainty * 100)}%</small></div>
        <div className="prediction-metrics-grid">
          <RangeMetric label="Distance" range={prediction.distanceM} unit="m" />
          <RangeMetric label="Airtime" range={prediction.airtimeS} unit="s" />
          <RangeMetric label="Glide ratio" range={prediction.glideRatio} unit=":1" />
          <RangeMetric label="Stall speed" range={prediction.stallSpeedMps} unit="m/s" />
        </div>
        <StatusMeter label="Stability" value={prediction.stabilityScore} detail={`Static margin ${prediction.staticMarginPercent}%`} />
      </section>
      <section className="engineering-readout">
        <h3>Engineering readout</h3>
        <dl>
          <div><dt>Mass</dt><dd>{prediction.massG} g</dd></div>
          <div><dt>Wing area</dt><dd>{(prediction.wingAreaM2 * 10_000).toFixed(0)} cm²</dd></div>
          <div><dt>Aspect ratio</dt><dd>{prediction.aspectRatio}</dd></div>
          <div><dt>Wing loading</dt><dd>{prediction.wingLoadingNpm2} N/m²</dd></div>
          <div><dt>Reynolds number</dt><dd>{prediction.reynoldsNumber.toLocaleString()}</dd></div>
          <div><dt>CL / CD</dt><dd>{prediction.liftCoefficient} / {prediction.dragCoefficient}</dd></div>
        </dl>
      </section>
      {warnings.length ? <section className="warning-panel"><strong>Geometry notes</strong>{warnings.map(warning => <p key={warning}>{warning}</p>)}</section> : null}
    </div>
  )
}
