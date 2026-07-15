import type { NumericRange } from '../domain/shared/types'

interface RangeMetricProps {
  label: string
  range: NumericRange
  unit: string
  source?: 'calculated' | 'modeled' | 'heuristic'
}

export function RangeMetric({ label, range, unit, source = 'modeled' }: RangeMetricProps) {
  return (
    <div className="range-metric">
      <div className="range-label"><span>{label}</span><small data-source={source}>{source}</small></div>
      <strong>{range.nominal} {unit}</strong>
      <span>{range.low}–{range.high} {unit}</span>
    </div>
  )
}
