import { fileURLToPath } from 'node:url';
import path from 'node:path';

export const harnessRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const packageRoot = path.resolve(harnessRoot, '../..');
export const repoRoot = path.resolve(packageRoot, '../..');
export const upstreamRoot = path.join(harnessRoot, 'upstream');
export const expectationsRoot = path.join(harnessRoot, 'expectations');
export const provenancePath = path.join(harnessRoot, 'provenance.json');
export const inventoryPath = path.join(harnessRoot, 'expected-test-urls.json');
export const expectedResultsPath = path.join(harnessRoot, 'expected-results.json');
export const configPath = path.join(harnessRoot, 'config.json');
export const browserLockPath = path.join(harnessRoot, 'browser-lock.json');
export const polyfillSourcePath = path.join(packageRoot, 'src/index.ts');
export const cacheRoot = path.resolve(process.env.RXJS_WPT_CACHE_DIR ?? path.join(repoRoot, '.cache/rxjs-wpt'));
export const reportsRoot = path.resolve(process.env.RXJS_WPT_REPORTS_DIR ?? path.join(cacheRoot, 'reports'));
