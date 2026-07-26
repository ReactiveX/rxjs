import { beforeAll, describe, it } from 'vitest';
import { rxTest } from '../../../test/src/index.js';
import manifestJson from './manifest.generated.json' with { type: 'json' };
import { createRuntime, loadCapabilities } from './capabilities.js';
import verifiedColdPasses from './verified-cold-passes.json' with { type: 'json' };
import verifiedPolyfillPasses from './verified-polyfill-passes.json' with { type: 'json' };
import type { PortManifest, PortMode, PortedMarbleCase } from './types.js';

const manifest = manifestJson as PortManifest;
const mode = (process.env.RXJS_NEXT_TEST_MODE ?? 'cold') as PortMode;
const audit = process.env.RXJS_NEXT_AUDIT === 'true';
const nativeAvailableAtLoad = typeof globalThis.Observable === 'function';
const verifiedPasses = new Set(mode === 'cold' ? verifiedColdPasses.locations : verifiedPolyfillPasses.locations);
let nativeAvailable = true;
let capabilities: Awaited<ReturnType<typeof loadCapabilities>>;

if (verifiedColdPasses.sourceCommit !== manifest.sourceCommit || verifiedPolyfillPasses.sourceCommit !== manifest.sourceCommit) {
  throw new Error('The ported-test pass baselines do not target the manifest source revision.');
}

beforeAll(async () => {
  if (mode === 'native') {
    nativeAvailable = typeof globalThis.Observable === 'function';
    if (!nativeAvailable) {
      return;
    }
  } else {
    await import('@rxjs/observable-polyfill');
    if (mode === 'cold') {
      const { ColdObservable } = await import('../../src/cold-observable.js');
      Object.defineProperty(globalThis, 'Observable', {
        configurable: true,
        value: ColdObservable,
        writable: true,
      });
    }
  }
  capabilities = await loadCapabilities();
});

describe(`ported RxJS 7 marble evidence (${audit ? `${mode} audit` : mode})`, () => {
  if (mode === 'native' && !nativeAvailableAtLoad) {
    it.skip('native Observable is not present in this realm', () => {});
  }
  for (const testCase of manifest.cases) {
    if (mode === 'native' && !nativeAvailableAtLoad) {
      continue;
    }
    if (!testCase.modes.includes(mode)) {
      continue;
    }
    if (!audit && testCase.disposition === 'deduplicated') {
      it.skip(testName(testCase), () => runCase(testCase));
    } else if (audit || verifiedPasses.has(`${testCase.source.path}:${testCase.source.line}`)) {
      it(testName(testCase), () => runCase(testCase));
    } else {
      it.fails(testName(testCase), () => runCase(testCase));
    }
  }
});

async function runCase(testCase: PortedMarbleCase): Promise<void> {
  if (mode === 'native' && !nativeAvailable) {
    return;
  }
  if (testCase.disposition === 'missing-api') {
    throw new Error(`[missing-api] ${testCase.id}: ${testCase.reason}`);
  }
  if (testCase.disposition === 'unsupported-or-obsolete') {
    throw new Error(`[unavailable-harness] ${testCase.id}: ${testCase.reason}`);
  }
  if (!testCase.migratedProgram) {
    throw new Error(`Case ${testCase.id} has no migrated program.`);
  }
  const runtime = createRuntime({ testCase, mode, rxTest, capabilities });
  const factory = new Function(`${testCase.migratedProgram}\nreturn migrated;`) as () => (runtime: unknown) => Promise<void>;
  await factory()(runtime);
}

function testName(testCase: PortedMarbleCase): string {
  return `${testCase.source.path}:${testCase.source.line} ${testCase.behavioralClaim}`;
}
