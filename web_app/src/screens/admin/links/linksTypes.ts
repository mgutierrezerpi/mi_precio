import type { LinkTree } from '../../../types'

export type UpdateTree = <K extends keyof LinkTree>(
  key: K,
  value: LinkTree[K]
) => void
