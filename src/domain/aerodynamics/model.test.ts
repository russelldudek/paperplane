import { createFamilyGenome } from '../aircraft/families'
import { simulateFlight } from './model'
import { calmEnvironment, standardLaunch } from '../shared/types'

describe('reduced-order flight model', () => {
  it('derives positive geometry and uncertainty ranges for a broad glider', () => {
    const prediction = simulateFlight(createFamilyGenome('broad-glider'), calmEnvironment, standardLaunch)

    expect(prediction.wingAreaM2).toBeGreaterThan(0)
    expect(prediction.aspectRatio).toBeGreaterThan(1)
    expect(prediction.stallSpeedMps.high).toBeGreaterThan(prediction.stallSpeedMps.low)
    expect(prediction.distanceM.high).toBeGreaterThan(prediction.distanceM.low)
    expect(prediction.airtimeS.nominal).toBeGreaterThan(1)
    expect(prediction.confidence).toMatch(/medium|high/)
  })

  it('shows that a heavier payload increases wing loading and stall speed', () => {
    const empty = createFamilyGenome('payload-carrier')
    const loaded = { ...empty, payloadMassG: 12 }

    const emptyPrediction = simulateFlight(empty, calmEnvironment, standardLaunch)
    const loadedPrediction = simulateFlight(loaded, calmEnvironment, standardLaunch)

    expect(loadedPrediction.wingLoadingNpm2).toBeGreaterThan(emptyPrediction.wingLoadingNpm2)
    expect(loadedPrediction.stallSpeedMps.nominal).toBeGreaterThan(emptyPrediction.stallSpeedMps.nominal)
  })
})
