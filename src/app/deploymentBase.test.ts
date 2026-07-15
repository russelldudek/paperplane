import { describe, expect, it } from 'vitest'
import config from '../../vite.config'

describe('GitHub Pages deployment base', () => {
  it('builds assets under the paperplane project path', () => {
    expect(config).toMatchObject({ base: '/paperplane/' })
  })
})
