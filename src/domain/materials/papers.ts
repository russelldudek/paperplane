export interface PaperMaterial { id: 'copy-75' | 'copy-90' | 'light-card-120'; name: string; gsm: number; thicknessMm: number; stiffness: number; roughness: number; creaseRetention: number }
export const paperMaterials: Record<PaperMaterial['id'], PaperMaterial> = {
  'copy-75': { id: 'copy-75', name: 'Light copy paper', gsm: 75, thicknessMm: 0.1, stiffness: 0.46, roughness: 0.42, creaseRetention: 0.7 },
  'copy-90': { id: 'copy-90', name: 'Premium copy paper', gsm: 90, thicknessMm: 0.12, stiffness: 0.58, roughness: 0.36, creaseRetention: 0.78 },
  'light-card-120': { id: 'light-card-120', name: 'Light cardstock', gsm: 120, thicknessMm: 0.16, stiffness: 0.82, roughness: 0.32, creaseRetention: 0.64 },
}
export function getPaperMaterial(id: PaperMaterial['id']): PaperMaterial { return paperMaterials[id] }
