export type Mission = 'distance' | 'airtime' | 'accuracy' | 'aerobatics' | 'payload'
export type LearnerProfile = 'explorer' | 'investigator' | 'engineer' | 'maker' | 'advanced'
export type ConstructionLevel = 1 | 2 | 3
export type ConfidenceLevel = 'low' | 'medium' | 'high'
export interface NumericRange { low: number; nominal: number; high: number }
export interface Environment { airDensityKgM3: number; dynamicViscosityPaS: number; windSpeedMps: number; gustiness: 'calm' | 'light' | 'gusty'; indoor: boolean }
export interface LaunchProfile { speedMps: number; elevationDeg: number; bankDeg: number; releaseHeightM: number; repeatability: number }
export const calmEnvironment: Environment = { airDensityKgM3: 1.225, dynamicViscosityPaS: 1.81e-5, windSpeedMps: 0, gustiness: 'calm', indoor: true }
export const standardLaunch: LaunchProfile = { speedMps: 8.5, elevationDeg: 8, bankDeg: 0, releaseHeightM: 1.55, repeatability: 0.09 }
