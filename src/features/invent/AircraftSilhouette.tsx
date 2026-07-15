import type { AircraftGenome } from '../../domain/aircraft/genome'

interface AircraftSilhouetteProps {
  genome: AircraftGenome
}

export function AircraftSilhouette({ genome }: AircraftSilhouetteProps) {
  const span = 66 + genome.geometry.spanRatio * 72
  const chord = 46 + genome.geometry.chordRatio * 74
  const sweep = genome.geometry.sweepDeg * 0.55
  const noseX = 150
  const rearX = Math.max(40, 150 - chord)
  const halfSpan = span / 2
  const wingTipX = rearX + sweep
  const points = `${noseX},75 ${wingTipX},${75 - halfSpan} ${rearX},69 ${72},75 ${rearX},81 ${wingTipX},${75 + halfSpan}`

  return (
    <svg className="aircraft-silhouette" viewBox="0 0 180 150" role="img" aria-label={`${genome.name} top-view silhouette`}>
      <defs>
        <linearGradient id={`plane-${genome.id}`} x1="0" x2="1">
          <stop offset="0" stopColor="#dff7fa" />
          <stop offset="1" stopColor="#fffdf8" />
        </linearGradient>
      </defs>
      <path d={`M90 12 90 138`} stroke="#b6c7d2" strokeDasharray="4 5" />
      <polygon points={points} fill={`url(#plane-${genome.id})`} stroke="#0b243c" strokeWidth="3" strokeLinejoin="round" />
      <path d={`M72 75 ${noseX} 75`} stroke="#f26a4b" strokeWidth="2.5" />
      <path d={`M${rearX + 8} 75 ${wingTipX} ${75 - halfSpan}`} stroke="#40c4d9" strokeWidth="2" strokeDasharray="4 4" />
    </svg>
  )
}
