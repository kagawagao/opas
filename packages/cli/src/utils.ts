import { cosmiconfig } from 'cosmiconfig'
import path from 'node:path'
import signale from 'signale'

export const configExplore = cosmiconfig('opas')
const workDir = process.cwd()

export function getPathFromWorkDir(...args: string[]) {
  return path.resolve(workDir, ...args)
}

export const logger = signale.scope('opas')
