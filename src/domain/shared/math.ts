import type { NumericRange } from './types'
export function clamp(value: number, minimum: number, maximum: number): number { return Math.min(maximum, Math.max(minimum, value)) }
export function round(value: number, decimals = 2): number { const scale = 10 ** decimals; return Math.round(value * scale) / scale }
export function rangeAround(nominal: number, relativeSpread: number, decimals = 2): NumericRange { const spread = Math.abs(relativeSpread); return { low: round(nominal * (1 - spread), decimals), nominal: round(nominal, decimals), high: round(nominal * (1 + spread), decimals) } }
export function degreesToRadians(degrees: number): number { return degrees * Math.PI / 180 }
