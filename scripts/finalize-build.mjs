import { access, rename, rm } from 'node:fs/promises'

const source = new URL('../dist/app.html', import.meta.url)
const target = new URL('../dist/index.html', import.meta.url)

await access(source)
await rm(target, { force: true })
await rename(source, target)
