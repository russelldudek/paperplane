import type { FlightPrediction } from '../../domain/aerodynamics/model'
import type { LaunchProfile } from '../../domain/shared/types'

interface TrajectoryPlotProps {
  prediction: FlightPrediction
  launch: LaunchProfile
}

export function TrajectoryPlot({ prediction, launch }: TrajectoryPlotProps) {
  const width = 640
  const height = 260
  const baseline = 220
  const range = Math.max(4, prediction.distanceM.nominal)
  const peak = Math.min(150, 40 + launch.releaseHeightM * 40 + launch.elevationDeg * 2.1)
  const points = Array.from({ length: 31 }, (_, index) => {
    const t = index / 30
    const x = 28 + t * (width - 56)
    const arc = 4 * t * (1 - t)
    const y = baseline - (launch.releaseHeightM * 20 * (1 - t)) - arc * peak
    return `${x},${Math.min(baseline, y)}`
  }).join(' ')

  return (
    <div className="trajectory-panel">
      <div className="trajectory-title"><div><span>Modeled trajectory</span><strong>{range.toFixed(1)} m nominal range</strong></div><small>educational approximation</small></div>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Modeled paper airplane trajectory">
        <defs>
          <linearGradient id="trajectoryArea" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#40c4d9" stopOpacity="0.28" />
            <stop offset="1" stopColor="#40c4d9" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3, 4].map(index => <line key={index} x1="28" x2={width - 28} y1={baseline - index * 44} y2={baseline - index * 44} stroke="#dce4e7" strokeWidth="1" />)}
        <line x1="28" x2={width - 28} y1={baseline} y2={baseline} stroke="#90a5b3" strokeWidth="2" />
        <polygon points={`28,${baseline} ${points} ${width - 28},${baseline}`} fill="url(#trajectoryArea)" />
        <polyline points={points} fill="none" stroke="#0b243c" strokeWidth="4" strokeLinecap="round" />
        <circle cx="28" cy={baseline - launch.releaseHeightM * 20} r="7" fill="#f26a4b" />
        <circle cx={width - 28} cy={baseline} r="5" fill="#0b243c" />
      </svg>
      <div className="trajectory-axis"><span>Launch</span><span>{range.toFixed(1)} m</span></div>
    </div>
  )
}
