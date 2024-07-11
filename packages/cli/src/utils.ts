import { cosmiconfig, CosmiconfigResult } from 'cosmiconfig';
import path from 'node:path';
import signale from 'signale';
import { OpasConfig } from './types';

export const configExplore = cosmiconfig('opas');
const workDir = process.cwd();

export function getPathFromWorkDir(...args: string[]) {
  return path.resolve(workDir, ...args);
}

export const logger = signale.scope('opas');

export async function resolveConfig(configPath?: string) {
  let searchResult: CosmiconfigResult;
  if (configPath) {
    searchResult = await configExplore.load(configPath);
  } else {
    searchResult = await configExplore.search();
  }

  if (searchResult) {
    return searchResult.config as OpasConfig;
  } else {
    return undefined;
  }
}
