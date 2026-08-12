#!/usr/bin/env node

import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { resolveBrowserBinaries, runBrowserAsyncScript, verifyBrowser } from '../../../observable-polyfill/test/wpt/lib/browser.mjs';
import { readBrowserLock, readConfig } from '../../../observable-polyfill/test/wpt/lib/config.mjs';
import { extensionKernelCaseNames, runExtensionKernelContract } from './contract.mjs';

function assertCompletedCases(mode, completedCases) {
  assert.deepEqual(completedCases, extensionKernelCaseNames, `${mode} did not complete the full extension-kernel contract`);
}

async function runFallbackContract() {
  Reflect.deleteProperty(globalThis, 'Observable');
  Reflect.deleteProperty(globalThis, 'Subscriber');
  Reflect.deleteProperty(EventTarget.prototype, 'when');

  const { getObservablePolyfillInfo } = await import('@rxjs/observable-polyfill');
  const platformMap = globalThis.Observable.prototype.map;
  const [{ map }, { pipe }, { scan }, { switchMap }, { timeout }, { timer }] = await Promise.all([
    import('rxjs/map'),
    import('rxjs/pipe'),
    import('rxjs/scan'),
    import('rxjs/switch-map'),
    import('rxjs/timeout'),
    import('rxjs/timer'),
  ]);
  const info = getObservablePolyfillInfo();
  assert.equal(info?.packageName, '@rxjs/observable-polyfill');

  const completedCases = await runExtensionKernelContract({
    ObservableCtor: globalThis.Observable,
    platformMap,
    symbols: { map, pipe, scan, switchMap, timeout, timer },
  });
  assertCompletedCases('fallback', completedCases);
  return { completedCases, info };
}

async function buildBrowserBundle() {
  const result = await build({
    bundle: true,
    entryPoints: [fileURLToPath(new URL('./browser-entry.ts', import.meta.url))],
    format: 'iife',
    logLevel: 'silent',
    platform: 'browser',
    target: 'chrome120',
    write: false,
  });
  return result.outputFiles[0].text;
}

function createNativeContractScript(bundle) {
  return `
const done = arguments[arguments.length - 1];
const platformMap = globalThis.Observable.prototype.map;
${bundle}
const runContract = (${runExtensionKernelContract.toString()});
const expectedCases = ${JSON.stringify(extensionKernelCaseNames)};

void runContract({
  ObservableCtor: globalThis.Observable,
  platformMap,
  symbols: globalThis.__rxjsExtensionKernelPilot,
}).then(
  (completedCases) => {
    try {
      if (globalThis.Observable[Symbol.for('rxjs.observable.polyfill.info.v1')] !== undefined) {
        throw new Error('The native kernel mode selected an RxJS-marked fallback');
      }
      if (JSON.stringify(completedCases) !== JSON.stringify(expectedCases)) {
        throw new Error('The native kernel mode did not complete every case');
      }
      done({ completedCases, constructorName: globalThis.Observable.name, markedAsRxjsFallback: false });
    } catch (error) {
      done({ error: error?.stack ?? String(error) });
    }
  },
  (error) => done({ error: error?.stack ?? String(error) })
);
`;
}

async function runNativeContract() {
  const [config, browserLock, bundle] = await Promise.all([readConfig(), readBrowserLock(), buildBrowserBundle()]);
  const binaries = await resolveBrowserBinaries({ config, browserLock, allowDownload: true });
  const allowBrowserDrift = process.env.RXJS_WPT_ALLOW_BROWSER_DRIFT === '1';
  const browser = await verifyBrowser({ config, binaries, allowBrowserDrift });
  const result = await runBrowserAsyncScript({
    binaries,
    script: createNativeContractScript(bundle),
    label: 'Native RxJS extension-kernel contract',
  });

  assert.equal(result?.error, undefined, result?.error);
  assert.equal(result?.markedAsRxjsFallback, false);
  assertCompletedCases('native', result?.completedCases);
  return { completedCases: result.completedCases, constructorName: result.constructorName, versions: browser.versions };
}

const fallback = await runFallbackContract();
const native = await runNativeContract();

process.stdout.write(
  `RxJS extension-kernel contract passed ${fallback.completedCases.length} cases against ` +
    `the packaged fallback and native ${native.constructorName} in Chrome ${native.versions.chrome}.\n`
);
