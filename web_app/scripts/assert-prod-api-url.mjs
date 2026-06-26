import { readdir, readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'

const distDir = fileURLToPath(new URL('../dist', import.meta.url))
const forbidden = ['localhost:8000', 'http://localhost:8000/api/v1']

async function collectJsFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = await Promise.all(entries.map(async (entry) => {
    const path = join(dir, entry.name)
    return entry.isDirectory() ? collectJsFiles(path) : path
  }))
  return files.flat().filter((path) => path.endsWith('.js'))
}

const jsFiles = await collectJsFiles(distDir)
if (jsFiles.length === 0) {
  throw new Error('No production JavaScript bundle found in dist')
}

let hasApiPath = false
for (const file of jsFiles) {
  const contents = await readFile(file, 'utf8')
  hasApiPath ||= contents.includes('/api/v1')
  for (const value of forbidden) {
    if (contents.includes(value)) {
      throw new Error(`Production bundle contains forbidden API URL "${value}" in ${file}`)
    }
  }
}

if (!hasApiPath) {
  throw new Error('Production bundle does not contain the expected /api/v1 API path')
}
