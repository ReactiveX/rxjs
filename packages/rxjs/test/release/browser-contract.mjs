import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { extensionKernelCaseNames, runExtensionKernelContract } from '../kernel/contract.mjs';

export async function buildReleaseBrowserBundle() {
  const result = await build({
    bundle: true,
    conditions: ['browser', 'import'],
    entryPoints: [fileURLToPath(new URL('../kernel/browser-entry.ts', import.meta.url))],
    format: 'iife',
    logLevel: 'silent',
    platform: 'browser',
    target: 'es2022',
    write: false,
  });
  return `${result.outputFiles[0].text}
globalThis.__rxjsPlatformMap = globalThis.Observable.prototype.map;
globalThis.__rxjsRunReleaseContract = (${runExtensionKernelContract.toString()});`;
}

export function createReleaseContractScript() {
  return `
const done = arguments[arguments.length - 1];
const runContract = (${runExtensionKernelContract.toString()});
void runContract({
  ObservableCtor: globalThis.Observable,
  platformMap: globalThis.__rxjsPlatformMap,
  symbols: globalThis.__rxjsExtensionKernelPilot,
}).then(
  (completedCases) => done({
    completedCases,
    implementation:
      globalThis.Observable?.[Symbol.for('rxjs.observable.polyfill.info.v1')]?.packageName ?? 'native',
  }),
  (error) => done({ error: error?.stack ?? String(error) })
);
`;
}

export { extensionKernelCaseNames };
