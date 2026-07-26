#!/usr/bin/env node

import assert from 'node:assert/strict';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { Script } from 'node:vm';
import { analyzePaths } from './analyze-marble-tests.mjs';
import { checkPortability } from './check-portability.mjs';

const fixtureDirectory = await mkdtemp(resolve(tmpdir(), 'rxjs-marble-skill-'));
const fixturePath = resolve(fixtureDirectory, 'example.spec.ts');
await writeFile(
  fixturePath,
  `
import { TestScheduler } from 'rxjs/testing';

it('maps a value', () => {
  scheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
    const source = cold('-a|');
    expectObservable(source).toBe('-b|');
    expectSubscriptions(source.subscriptions).toBe('^--!');
  });
});

it('maps a value', () => {
  testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
    const source = cold('-a|');
    expectObservable(source).toBe('-b|');
    expectSubscriptions(source.subscriptions).toBe('^--!');
  });
});

test('flushes work', () => {
  scheduler.run(({ cold, expectObservable, flush }) => {
    expectObservable(cold('--a|')).toBe('--a|');
    flush();
  });
});

it('switches to the latest inner source', () => {
  scheduler.run(({ cold, hot, expectObservable }) => {
    const first = cold('--a|');
    const second = cold('-b|');
    const source = hot('-x-y|', { x: first, y: second });
    expectObservable(source.pipe(switchAll())).toBe('---a-b|');
  });
});

it('uses a scheduler argument for time', () => {
  scheduler.run(({ cold, expectObservable }) => {
    expectObservable(cold('--a|').pipe(delay(2, asyncScheduler))).toBe('----a|');
  });
});

it('shares two observations', () => {
  scheduler.run(({ cold, expectObservable }) => {
    const source = cold('--a--b--|');
    expectObservable(source).toBe('--a--b--|');
    expectObservable(source, '---^').toBe('-----a--b--|');
  });
});

it('inspects scheduler internals', () => {
  expect(scheduler.frame).toBe(0);
  scheduler.maxFrames = 100;
  scheduler.createColdObservable('--a|');
});

it('keeps a missing operator claim', () => {
  scheduler.run(({ cold, expectObservable }) => {
    expectObservable(cold('--a|').pipe(windowCount(2))).toBe('--x|');
  });
});
`,
  'utf8'
);

const analysis = await analyzePaths([fixtureDirectory]);
assert.equal(analysis.cases.length, 8);
assert.equal(analysis.duplicateCandidates, 1);
assert.deepEqual(analysis.cases[0]?.helpers, ['cold', 'expectObservable', 'expectSubscriptions']);
assert.deepEqual(analysis.cases[2]?.reviewFlags, ['await-flush']);
assert.deepEqual(analysis.cases[4]?.reviewFlags, ['scheduler-argument']);
assert.deepEqual(analysis.cases[5]?.reviewFlags, ['multiple-observers']);
assert.deepEqual(analysis.cases[6]?.reviewFlags, ['scheduler-internals', 'manual-test-scheduler']);

const migratedSyntaxCases = [
  `
it('preserves the framework', () =>
  rxTest(({ cold, expectObservable }) => {
    const source = cold('-a|');
    expectObservable(source[scan]((sum, value) => sum + value, 0)).toBe('-b|');
  }));
`,
  `
test('awaits flush', () =>
  rxTest(async ({ cold, expectObservable, flush }) => {
    expectObservable(cold('--a|')).toBe('--a|');
    await flush();
  }));
`,
  `
it('uses the global platform Observable', () =>
  rxTest(({ expectObservable }) => {
    const source = new Observable((subscriber) => subscriber.complete());
    expectObservable(source).toBe('|');
  }));
`,
];
for (const source of migratedSyntaxCases) {
  new Script(source);
}

const skillDirectory = resolve(import.meta.dirname, '..');
const portability = await checkPortability(skillDirectory);
assert.deepEqual(portability.findings, []);

process.stdout.write('rxjs-next-marble-migration helper tests passed\n');
