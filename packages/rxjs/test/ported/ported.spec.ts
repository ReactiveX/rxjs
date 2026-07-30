import { beforeAll, describe, it } from 'vitest';
import { rxTest } from '../../../test/src/index.js';
import manifestJson from './manifest.generated.json' with { type: 'json' };
import { createRuntime, loadCapabilities } from './capabilities.js';
import type { PortManifest, PortMode, PortedMarbleCase } from './types.js';

const manifest = manifestJson as PortManifest;
const mode = (process.env.RXJS_NEXT_TEST_MODE ?? 'cold') as PortMode;
const shardCount = parseShardValue('RXJS_NEXT_SHARD_COUNT', 1);
const shardIndex = parseShardValue('RXJS_NEXT_SHARD_INDEX', 0);
const nativeAvailableAtLoad = typeof globalThis.Observable === 'function';
const nativeObservableAtLoad = globalThis.Observable;
// Keep this source ID registered as an ordinary failure, but fail it before
// executing a converted program proven not to yield before the host kills its
// isolated shard. The manifest retains the original program for later repair.
const nonTerminatingConvertedPrograms = new Map<string, string>([
  [
    'spec/schedulers/TestScheduler-spec.ts:198:TestScheduler > createHotObservable() > should create a hot observable',
    'The direct-subscription manual-TestScheduler conversion does not yield control or finalize under rxTest.',
  ],
]);
let nativeAvailable = true;
let nativeAcquisitionBlocker: Error | undefined;
let capabilities: Awaited<ReturnType<typeof loadCapabilities>>;

assertMode(mode);
if (shardIndex >= shardCount) {
  throw new Error(`Ported-test shard index ${shardIndex} must be less than shard count ${shardCount}.`);
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
  if (mode === 'native' && globalThis.Observable !== nativeObservableAtLoad) {
    nativeAcquisitionBlocker = new Error(
      '[native-acquisition-blocker] Loading RxJS extension capabilities replaced the ambient native Observable; this mode cannot report polyfill execution as native.'
    );
  }
});

describe(`ported RxJS 7 marble evidence (${mode}, shard ${shardIndex + 1}/${shardCount})`, () => {
  if (mode === 'native' && !nativeAvailableAtLoad) {
    it.skip(`native Observable is not present in this realm (shard ${shardIndex + 1}/${shardCount})`, () => {});
  }
  for (const [caseIndex, testCase] of manifest.cases.entries()) {
    if (mode === 'native' && !nativeAvailableAtLoad) {
      continue;
    }
    if (caseIndex % shardCount !== shardIndex) {
      continue;
    }
    if (!testCase.modes.includes(mode)) {
      continue;
    }
    it(testName(testCase), () => runCase(testCase));
  }
});

async function runCase(testCase: PortedMarbleCase): Promise<void> {
  if (mode === 'native' && !nativeAvailable) {
    return;
  }
  if (nativeAcquisitionBlocker) {
    throw nativeAcquisitionBlocker;
  }
  if (!testCase.migratedProgram) {
    throw new Error(`[${testCase.disposition}] ${testCase.id}: no executable migrated program (${testCase.reason})`);
  }
  const nonTerminatingReason = nonTerminatingConvertedPrograms.get(testCase.id);
  if (nonTerminatingReason) {
    throw new Error(`[non-terminating-conversion] ${testCase.id}: ${nonTerminatingReason}`);
  }
  const runtime = createRuntime({ testCase, mode, rxTest, capabilities });
  try {
    const factory = new Function(`${testCase.migratedProgram}\nreturn migrated;`) as () => (runtime: unknown) => Promise<void>;
    await factory()(runtime);
  } catch (error) {
    const diagnostic = error instanceof Error ? error.message : String(error);
    throw new Error(
      `[${testCase.disposition}] ${testCase.id}: ${testCase.reason}\nConverted-program diagnostic: ${diagnostic}`,
      { cause: error }
    );
  }
}

function testName(testCase: PortedMarbleCase): string {
  const duplicate = testCase.disposition === 'deduplicated' ? ` [duplicate of ${testCase.duplicateOf}]` : '';
  return `[case-id:${encodeURIComponent(testCase.id)}] ${locationOf(testCase)} ${testCase.behavioralClaim}${duplicate}`;
}

function locationOf(testCase: PortedMarbleCase): string {
  return `${testCase.source.path}:${testCase.source.line}`;
}

function assertMode(value: string): asserts value is PortMode {
  if (value !== 'cold' && value !== 'polyfill' && value !== 'native') {
    throw new Error(`Unknown ported-test mode: ${value}`);
  }
}

function parseShardValue(name: 'RXJS_NEXT_SHARD_COUNT' | 'RXJS_NEXT_SHARD_INDEX', fallback: number): number {
  const rawValue = process.env[name];
  if (rawValue === undefined) {
    return fallback;
  }
  const value = Number(rawValue);
  const minimum = name === 'RXJS_NEXT_SHARD_COUNT' ? 1 : 0;
  if (!Number.isSafeInteger(value) || value < minimum) {
    throw new Error(`${name} must be a safe integer greater than or equal to ${minimum}; received ${rawValue}.`);
  }
  return value;
}
