interface StatusMeterProps {
  label: string
  value: number
  detail?: string
}

export function StatusMeter({ label, value, detail }: StatusMeterProps) {
  const safeValue = Math.max(0, Math.min(100, value))
  return (
    <div className="status-meter">
      <div className="status-meter-head"><span>{label}</span><strong>{Math.round(safeValue)}</strong></div>
      <div className="meter-track"><span style={{ width: `${safeValue}%` }} /></div>
      {detail ? <small>{detail}</small> : null}
    </div>
  )
}
