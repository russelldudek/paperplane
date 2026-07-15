import { Clock3, Crosshair, Package, Sparkles, Trophy } from 'lucide-react'
import type { Mission } from '../../domain/shared/types'

const missions: Array<{ id: Mission; label: string; description: string; icon: typeof Trophy }> = [
  { id: 'distance', label: 'Maximum Distance', description: 'Carry launch energy into a long, stable glide.', icon: Trophy },
  { id: 'airtime', label: 'Maximum Airtime', description: 'Reduce sink rate and stay aloft.', icon: Clock3 },
  { id: 'accuracy', label: 'Target Accuracy', description: 'Favor repeatability and directional stability.', icon: Crosshair },
  { id: 'aerobatics', label: 'Aerobatics', description: 'Trade stability for loops and controlled turns.', icon: Sparkles },
  { id: 'payload', label: 'Payload Carrier', description: 'Lift a small classroom-safe payload.', icon: Package },
]

interface MissionSelectorProps {
  value: Mission
  onChange: (mission: Mission) => void
}

export function MissionSelector({ value, onChange }: MissionSelectorProps) {
  return (
    <div className="mission-grid" aria-label="Choose flight mission">
      {missions.map(({ id, label, description, icon: Icon }) => (
        <button key={id} type="button" className="mission-card" aria-pressed={value === id} onClick={() => onChange(id)}>
          <span className="mission-icon"><Icon size={20} /></span>
          <span><strong>{label}</strong><small>{description}</small></span>
        </button>
      ))}
    </div>
  )
}
