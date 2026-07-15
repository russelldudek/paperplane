import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import config from '../../vite.config'

describe('production boot configuration', () => {
  it('uses stable production asset names so cached HTML cannot point at deleted bundles', () => {
    const output = config.build?.rollupOptions?.output

    expect(Array.isArray(output)).toBe(false)
    expect(output).toMatchObject({
      entryFileNames: 'assets/app.js',
      chunkFileNames: 'assets/chunk-[name].js',
      assetFileNames: 'assets/app[extname]',
    })
  })

  it('automatically cache-busts once and exposes a useful startup diagnostic', () => {
    const html = readFileSync(new URL('../../index.html', import.meta.url), 'utf8')

    expect(html).toContain('pal-reload=')
    expect(html).toContain('scriptDiagnostic')
    expect(html).toContain('data-pal-ready')
    expect(html).toContain('stable-assets-v1')
  })
})
