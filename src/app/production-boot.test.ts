import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('production boot configuration', () => {
  it('uses stable production asset names so cached HTML cannot point at deleted bundles', () => {
    const config = readFileSync(resolve(process.cwd(), 'vite.config.ts'), 'utf8')

    expect(config).toContain("entryFileNames: 'assets/app.js'")
    expect(config).toContain("chunkFileNames: 'assets/chunk-[name].js'")
    expect(config).toContain("assetFileNames: 'assets/app[extname]'")
    expect(config).toContain('cssCodeSplit: false')
  })

  it('automatically cache-busts once and exposes a useful startup diagnostic', () => {
    const html = readFileSync(resolve(process.cwd(), 'index.html'), 'utf8')

    expect(html).toContain('pal-reload=')
    expect(html).toContain('scriptDiagnostic')
    expect(html).toContain('data-pal-ready')
    expect(html).toContain('stable-assets-v1')
  })
})
