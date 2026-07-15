import type { AircraftGenome } from '../aircraft/genome'
export interface ValidationResult { valid: boolean; errors: string[]; warnings: string[] }
export function validateGenome(genome: AircraftGenome): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  const geometry = genome.geometry
  if (geometry.spanRatio < 0.42 || geometry.spanRatio > 1) errors.push('Wing span leaves the supported sheet envelope.')
  if (geometry.chordRatio < 0.2 || geometry.chordRatio > 0.62) errors.push('Wing chord is outside the foldable range.')
  if (geometry.dihedralDeg < -2 || geometry.dihedralDeg > 18) errors.push('Dihedral cannot be opened reliably from the fold sequence.')
  if (geometry.sweepDeg < 8 || geometry.sweepDeg > 56) errors.push('Wing sweep exceeds the validated planform range.')
  if (geometry.noseMassFraction < 0.1 || geometry.noseMassFraction > 0.34) errors.push('Folded mass distribution is not physically supported.')
  if (geometry.symmetryError > 0.055) errors.push('Left-right asymmetry exceeds the safe generation limit.')
  if (genome.constructionLevel === 1 && genome.payloadMassG > 0) errors.push('Pure origami aircraft cannot carry an attached payload.')
  if (geometry.symmetryError > 0.025) warnings.push('This design is unusually sensitive to fold alignment.')
  if (genome.foldComplexity > 0.72) warnings.push('Several steps require careful alignment through multiple layers.')
  if (Math.abs(geometry.controlTabDeg) > 6) warnings.push('Large control-tab deflection makes the aircraft experimental.')
  if (geometry.dihedralDeg < 3) warnings.push('Low dihedral reduces passive roll stability.')
  return { valid: errors.length === 0, errors, warnings }
}
