import fs from 'node:fs/promises';
import { browserLockPath, configPath } from './paths.mjs';

export async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, 'utf8'));
}

export async function readConfig() {
  return readJson(configPath);
}

export async function readBrowserLock() {
  return readJson(browserLockPath);
}

export function approvedImportPaths(config) {
  if (typeof config.wpt.testRoot !== 'string' || !Array.isArray(config.wpt.supportFiles)) {
    throw new Error('WPT config must declare one testRoot and an exact supportFiles closure');
  }
  return [config.wpt.testRoot, ...config.wpt.supportFiles];
}
