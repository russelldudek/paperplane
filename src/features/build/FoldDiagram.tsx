import type { FoldStep } from '../../domain/instructions/folds'
interface FoldDiagramProps { step: FoldStep }
export function FoldDiagram({ step }: FoldDiagramProps) {
  const toX = (value: number) => 28 + value * 244
  const toY = (value: number) => 18 + value * 324
  return <svg className="fold-diagram" viewBox="0 0 300 365" role="img" aria-label={`Fold diagram: ${step.title}`}><defs><marker id={`arrow-${step.id}`} markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0 8 4 0 8Z" fill="#f26a4b" /></marker></defs><rect x="28" y="18" width="244" height="324" rx="5" fill="#fffdf8" stroke="#0b243c" strokeWidth="2" /><line x1="150" x2="150" y1="18" y2="342" stroke="#b4c1c9" strokeDasharray="5 6" /><line x1={toX(step.crease.start.x)} y1={toY(step.crease.start.y)} x2={toX(step.crease.end.x)} y2={toY(step.crease.end.y)} stroke={step.crease.orientation === 'mountain' ? '#f26a4b' : '#40c4d9'} strokeWidth="4" strokeDasharray={step.crease.orientation === 'mountain' ? '12 6 2 6' : '8 7'} />{step.arrows.map((arrow, index) => <line key={index} x1={toX(arrow.from.x)} y1={toY(arrow.from.y)} x2={toX(arrow.to.x)} y2={toY(arrow.to.y)} stroke="#f26a4b" strokeWidth="3" strokeLinecap="round" markerEnd={`url(#arrow-${step.id})`} />)}<text x="42" y="44" fill="#60778b" fontSize="11" fontWeight="700">{step.crease.orientation.toUpperCase()} FOLD</text></svg>
}
