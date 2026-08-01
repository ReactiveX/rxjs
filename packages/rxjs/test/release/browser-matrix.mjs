import assert from 'node:assert/strict';
import { chromium, firefox, webkit } from '@playwright/test';
import { buildReleaseBrowserBundle, extensionKernelCaseNames } from './browser-contract.mjs';

const browserTypes = { chromium, firefox, webkit };
const requested = process.argv.slice(2);
const selected = requested.length === 0 ? Object.keys(browserTypes) : requested;
for (const name of selected) {
  if (!(name in browserTypes)) throw new Error(`Unknown browser ${name}. Expected chromium, firefox, or webkit.`);
}

const bundle = await buildReleaseBrowserBundle();
const results = [];
for (const name of selected) {
  const browserType = browserTypes[name];
  const browser = await browserType.launch({ headless: true });
  try {
    const page = await browser.newPage();
    const pageErrors = [];
    page.on('pageerror', (error) => pageErrors.push(error.stack ?? String(error)));
    await page.addScriptTag({ content: bundle });
    const result = await page.evaluate(
      async ({ expectedCases }) => {
        const runContract = globalThis.__rxjsRunReleaseContract;
        const completedCases = await runContract({
          ObservableCtor: globalThis.Observable,
          platformMap: globalThis.__rxjsPlatformMap,
          symbols: globalThis.__rxjsExtensionKernelPilot,
        });
        const info = globalThis.Observable?.[Symbol.for('rxjs.observable.polyfill.info.v1')];
        return {
          completedCases,
          expectedCases,
          implementation: info?.packageName ?? 'native',
          version: info?.version,
        };
      },
      { expectedCases: extensionKernelCaseNames }
    );

    assert.deepEqual(result.completedCases, extensionKernelCaseNames, `${name} did not complete the release contract.`);
    assert.deepEqual(pageErrors, [], `${name} reported page errors:\n${pageErrors.join('\n')}`);
    results.push({ browser: name, browserVersion: browser.version(), implementation: result.implementation });
  } finally {
    await browser.close();
  }
}

process.stdout.write(`${JSON.stringify(results, null, 2)}\n`);
