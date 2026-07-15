import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('production boot configuration', () => {
  it('builds from the editable app entry and emits stable production assets', () => {
    const config = readFileSync(resolve(process.cwd(), 'vite.config.ts'), 'utf8')
    const packageJson = readFileSync(resolve(process.cwd(), 'package.json'), 'utf8')

    expect(config).toContain("new URL('./app.html', import.meta.url)")
    expect(config).toContain("entryFileNames: 'assets/app.js'")
    expect(config).toContain("chunkFileNames: 'assets/chunk-[name].js'")
    expect(config).toContain("assetFileNames: 'assets/app[extname]'")
    expect(config).toContain('cssCodeSplit: false')
    expect(packageJson).toContain('scripts/finalize-build.mjs')
  })

  it('keeps the diagnostics in the editable application entry', () => {
    const html = readFileSync(resolve(process.cwd(), 'app.html'), 'utf8')

    expect(html).toContain('pal-reload=')
    expect(html).toContain('scriptDiagnostic')
    expect(html).toContain('data-pal-ready')
    expect(html).toContain('compiled-root-v1')
    expect(html).toContain('/src/main.tsx')
  })

  it('publishes compiled output to the root used by legacy GitHub Pages', () => {
    const workflow = readFileSync(resolve(process.cwd(), '.github/workflows/pages.yml'), 'utf8')

    expect(workflow).toContain('cp dist/index.html index.html')
    expect(workflow).toContain('cp -R dist/assets assets')
    expect(workflow).toContain('chore: publish compiled Pages site')
    expect(workflow).toContain("! grep -q '/src/main.tsx' index.html")
  })
})
