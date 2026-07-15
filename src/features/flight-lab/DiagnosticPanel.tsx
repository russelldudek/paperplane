import { Gauge, Lightbulb } from 'lucide-react'
import type { DiagnosticRecommendation } from '../../domain/experiments/diagnostics'
interface DiagnosticPanelProps { recommendation: DiagnosticRecommendation }
export function DiagnosticPanel({ recommendation }: DiagnosticPanelProps) { return <section className="diagnostic-panel"><div className="diagnostic-icon"><Lightbulb size={22} /></div><div><span>One-variable recommendation</span><h2>{recommendation.title}</h2><p>{recommendation.primaryAdjustment}</p><div className="diagnostic-rationale"><Gauge size={16} /><span>{recommendation.rationale}</span></div><small>{recommendation.caution}</small></div></section> }
