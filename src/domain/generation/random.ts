export interface SeededRandom { next(): number; between(minimum: number, maximum: number): number; pick<T>(values: readonly T[]): T }
export function createSeededRandom(seed: number): SeededRandom {
  let state = (Math.trunc(seed) >>> 0) || 1
  const next = () => { state = (1664525 * state + 1013904223) >>> 0; return state / 0x1_0000_0000 }
  return { next, between(minimum, maximum) { return minimum + (maximum - minimum) * next() }, pick(values) { return values[Math.min(values.length - 1, Math.floor(next() * values.length))] } }
}
