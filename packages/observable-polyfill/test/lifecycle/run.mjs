#!/usr/bin/env node

import assert from 'node:assert/strict';
import { resolveBrowserBinaries, runBrowserAsyncScript, verifyBrowser } from '../wpt/lib/browser.mjs';
import { readBrowserLock, readConfig } from '../wpt/lib/config.mjs';
import { observableLifecycleCaseNames, runObservableLifecycleContract } from './contract.mjs';

function assertCompletedCases(mode, completedCases) {
  assert.deepEqual(completedCases, observableLifecycleCaseNames, `${mode} did not complete the full Observable lifecycle contract`);
}

async function captureFallbackReportedErrors(action) {
  const previousDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'reportError');
  const reportedErrors = [];
  Object.defineProperty(globalThis, 'reportError', {
    configurable: true,
    enumerable: false,
    value: (error) => reportedErrors.push(error),
    writable: true,
  });

  try {
    action();
    await Promise.resolve();
    return reportedErrors;
  } finally {
    if (previousDescriptor) {
      Object.defineProperty(globalThis, 'reportError', previousDescriptor);
    } else {
      Reflect.deleteProperty(globalThis, 'reportError');
    }
  }
}

async function runFallbackContract() {
  Reflect.deleteProperty(globalThis, 'Observable');
  Reflect.deleteProperty(globalThis, 'Subscriber');
  Reflect.deleteProperty(EventTarget.prototype, 'when');

  const { getObservablePolyfillInfo } = await import('@rxjs/observable-polyfill');
  const info = getObservablePolyfillInfo();
  assert.equal(info?.packageName, '@rxjs/observable-polyfill');
  assert.equal(typeof info.version, 'string');
  assert.equal(Object.isFrozen(info), true);

  const completedCases = await runObservableLifecycleContract({
    ObservableCtor: globalThis.Observable,
    captureReportedErrors: captureFallbackReportedErrors,
  });
  assertCompletedCases('fallback', completedCases);
  return { completedCases, info };
}

function createNativeContractScript() {
  return `
const done = arguments[arguments.length - 1];
const runContract = (${runObservableLifecycleContract.toString()});
const expectedCases = ${JSON.stringify(observableLifecycleCaseNames)};
const captureReportedErrors = async (action) => {
  const reportedErrors = [];
  const onError = (event) => {
    event.preventDefault();
    reportedErrors.push(event.error ?? event.message);
  };
  globalThis.addEventListener("error", onError);
  try {
    action();
    await new Promise((resolve) => globalThis.setTimeout(resolve, 0));
    return reportedErrors;
  } finally {
    globalThis.removeEventListener("error", onError);
  }
};

void runContract({
  ObservableCtor: globalThis.Observable,
  captureReportedErrors,
}).then(
  (completedCases) => {
    try {
      if (globalThis.Observable[Symbol.for("rxjs.observable.polyfill.info.v1")] !== undefined) {
        throw new Error("The native lifecycle mode selected an RxJS-marked fallback");
      }
      if (JSON.stringify(completedCases) !== JSON.stringify(expectedCases)) {
        throw new Error("The native lifecycle mode did not complete every case");
      }
      done({
        completedCases,
        constructorName: globalThis.Observable.name,
        markedAsRxjsFallback: false,
      });
    } catch (error) {
      done({ error: error?.stack ?? String(error) });
    }
  },
  (error) => done({ error: error?.stack ?? String(error) })
);
`;
}

async function runNativeContract() {
  const [config, browserLock] = await Promise.all([readConfig(), readBrowserLock()]);
  const binaries = await resolveBrowserBinaries({ config, browserLock, allowDownload: true });
  const allowBrowserDrift = process.env.RXJS_WPT_ALLOW_BROWSER_DRIFT === '1';
  const browser = await verifyBrowser({ config, binaries, allowBrowserDrift });
  const result = await runBrowserAsyncScript({
    binaries,
    script: createNativeContractScript(),
    label: 'Native Observable lifecycle contract',
  });

  assert.equal(result?.error, undefined, result?.error);
  assert.equal(result?.markedAsRxjsFallback, false);
  assertCompletedCases('native', result?.completedCases);
  return {
    completedCases: result.completedCases,
    constructorName: result.constructorName,
    versions: browser.versions,
  };
}

const fallback = await runFallbackContract();
const native = await runNativeContract();

process.stdout.write(
  `Observable lifecycle contract passed ${fallback.completedCases.length} cases against ` +
    `the packaged fallback and native ${native.constructorName} in Chrome ${native.versions.chrome}.\n`
);
