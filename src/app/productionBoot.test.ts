import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const currentDirectory = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(currentDirectory, '../..')

describe('production boot contract', () => {
  it('ships a visible boot fallback and a broadly compatible JavaScript target', () => {
    const html = readFileSync(resolve(projectRoot, 'index.html'), 'utf8')
    const viteConfig = readFileSync(resolve(projectRoot, 'vite.config.ts'), 'utf8')

    expect(html).toContain('id="boot-status"')
    expect(html).toContain('Paper Airplane Lab is loading')
    expect(viteConfig).toContain("target: 'es2019'")
  })
})
