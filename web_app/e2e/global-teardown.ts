import { execFileSync } from 'node:child_process'
import path from 'node:path'

export default function globalTeardown() {
  const repository = path.resolve(import.meta.dirname, '../..')
  execFileSync(
    'docker',
    [
      'compose',
      '-p',
      process.env.COMPOSE_PROJECT_NAME ?? 'mi_precio_e2e',
      '-f',
      'compose.yaml',
      '-f',
      'compose.e2e.yaml',
      'down',
      '--volumes',
      '--remove-orphans',
    ],
    { cwd: repository, stdio: 'inherit' }
  )
}
