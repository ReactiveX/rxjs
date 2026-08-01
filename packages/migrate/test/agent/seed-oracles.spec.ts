import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';
import { analyzeTestSource } from '../../src/analyze.js';
import { migrateTestSchedulerSemantics } from '../../src/semantics.js';
import { representativeAgentScenarios } from './scenario-catalog.js';

interface LegacySubscription {
  add(teardown: () => void): void;
  unsubscribe(): void;
}

interface LegacyObservable<T> {
  pipe<A>(first: LegacyOperator<T, A>): LegacyObservable<A>;
  pipe<A, B>(first: LegacyOperator<T, A>, second: LegacyOperator<A, B>): LegacyObservable<B>;
  subscribe(observer?: ((value: T) => void) | { next?(value: T): void }): LegacySubscription;
}

interface LegacySubject<T> extends LegacyObservable<T> {
  next(value: T): void;
}

type LegacyOperator<T, R> = (source: LegacyObservable<T>) => LegacyObservable<R>;

interface Rxjs7Runtime {
  firstValueFrom<T>(source: LegacyObservable<T>): Promise<T>;
  of<T>(...values: T[]): LegacyObservable<T>;
  toArray<T>(): LegacyOperator<T, T[]>;
}

interface ColdSeed {
  request(log: string[]): LegacyObservable<number>;
}

interface PlatformSeed {
  liveFeed(log: string[]): LegacyObservable<number>;
  status: LegacySubject<string>;
}

interface MixedSeed {
  doubled(values: Iterable<number>): LegacyObservable<number>;
  selectorFailure(): LegacyObservable<never>;
  windowed(source: LegacyObservable<number>): LegacyObservable<LegacyObservable<number>>;
}

interface WeakSeed {
  cached(source: LegacyObservable<number>): LegacyObservable<number>;
  legacyScheduled(values: number[]): LegacyObservable<number>;
  ticks(): LegacyObservable<number>;
}

const packageRoot = fileURLToPath(new URL('../../', import.meta.url));
const repositoryRoot = fileURLToPath(new URL('../../../../', import.meta.url));
const rxjs7Root = join(repositoryRoot, 'node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs');
const requireFromHere = createRequire(import.meta.url);
const rxjs7 = requireFromHere(rxjs7Root) as Rxjs7Runtime;
const rxjs7Operators = requireFromHere(join(rxjs7Root, 'operators')) as Record<string, unknown>;
const rxjs7Package = requireFromHere(join(rxjs7Root, 'package.json')) as { version: string };

describe('held-out RxJS 7 seed baselines', () => {
  it('loads the exact pinned runtime rather than the workspace RxJS Next package', () => {
    expect(rxjs7Package.version).toBe('7.8.1');
    expect(rxjs7Root).toContain('node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs');
  });

  it('app-cold-strong: preserves independent production, cancellation, values, and teardown order', async () => {
    const seed = await loadSeedModule<ColdSeed>('app-cold-strong', 'src/request.ts');
    const log: string[] = [];
    const firstValues: number[] = [];
    const secondValues: number[] = [];
    const first = seed.request(log).subscribe((value) => firstValues.push(value));
    const second = seed.request(log).subscribe((value) => secondValues.push(value));

    expect(firstValues).toEqual([42]);
    expect(secondValues).toEqual([42]);
    expect(log).toEqual(['start', 'start']);
    first.unsubscribe();
    second.unsubscribe();
    expect(log).toEqual(['start', 'start', 'stop', 'stop']);

    const teardownLog: string[] = [];
    const ordered = seed.request(teardownLog).subscribe();
    ordered.add(() => teardownLog.push('outer-stop'));
    ordered.unsubscribe();
    expect(teardownLog).toEqual(['start', 'stop', 'outer-stop']);
    await expectMarkers('app-cold-strong', ['PT-COLD-INDEPENDENT', 'PT-COLD-CANCELLATION', 'PT-COLD-TEARDOWN']);
  });

  it('app-platform-strong: establishes the RxJS 7 sharing, ref-count, Subject, and restart oracle', async () => {
    const seed = await loadSeedModule<PlatformSeed>('app-platform-strong', 'src/live-feed.ts');
    const log: string[] = [];
    const feed = seed.liveFeed(log);
    const firstValues: number[] = [];
    const lateValues: number[] = [];
    const first = feed.subscribe((value) => firstValues.push(value));
    const late = feed.subscribe((value) => lateValues.push(value));

    expect(firstValues).toEqual([1]);
    expect(lateValues).toEqual([]);
    expect(log).toEqual(['start']);
    first.unsubscribe();
    expect(log).toEqual(['start']);
    late.unsubscribe();
    expect(log).toEqual(['start', 'stop']);
    feed.subscribe().unsubscribe();
    expect(log).toEqual(['start', 'stop', 'start', 'stop']);

    seed.status.next('ready');
    const statuses: string[] = [];
    seed.status.subscribe((value) => statuses.push(value)).unsubscribe();
    expect(statuses).toEqual(['ready']);
    await expectMarkers('app-platform-strong', ['PT-PLATFORM-SHARING', 'PT-PLATFORM-SUBJECT', 'PT-PLATFORM-REPEAT']);
  });

  it('library-mixed-strong: preserves iterable conversion and errors while retaining the unsupported segment', async () => {
    const seed = await loadSeedModule<MixedSeed>('library-mixed-strong', 'src/index.ts');

    await expect(rxjs7.firstValueFrom(seed.doubled([1, 2]).pipe(rxjs7.toArray<number>()))).resolves.toEqual([2, 4]);
    await expect(rxjs7.firstValueFrom(seed.selectorFailure())).rejects.toThrow('selector failed');
    const firstWindow = await rxjs7.firstValueFrom(seed.windowed(rxjs7.of(1)));
    expect(firstWindow).toMatchObject({ subscribe: expect.any(Function) });

    const source = await seedSource('library-mixed-strong', 'src/index.ts');
    expect(source).toContain('windowTime(10)');
    expect(analyzeTestSource(source).missingCapabilities).toContain('windowTime');
    await expectMarkers('library-mixed-strong', ['PT-MIXED-ERROR', 'PT-MIXED-INPUT', 'PT-MIXED-PIPELINE']);
  });

  it('library-weak-unsupported: keeps the shallow baseline and refuses unsupported scheduler automation', async () => {
    const seed = await loadSeedModule<WeakSeed>('library-weak-unsupported', 'src/index.ts');
    expect(Object.keys(seed).sort()).toEqual(['cached', 'legacyScheduled', 'ticks']);

    const source = await seedSource('library-weak-unsupported', 'src/index.ts');
    const analysis = analyzeTestSource(source);
    expect(analysis.reviewFlags).toContain('scheduler-argument');
    expect(analysis.missingCapabilities).toEqual(expect.arrayContaining(['publishReplay', 'refCount']));
    const unsupported = migrateTestSchedulerSemantics(source, { mode: 'cold' });
    expect(unsupported).toMatchObject({ status: 'refused', code: source });
    const missingCapabilities = unsupported.diagnostics.filter(({ code }) => code === 'missing-capability');
    expect(missingCapabilities).toHaveLength(2);
    expect(missingCapabilities.map(({ message }) => message).join('\n')).toMatch(/publishReplay[\s\S]*refCount/);

    const schedulerControl = `
      import { asyncScheduler, debounceTime } from 'rxjs';
      declare const source: { pipe(...operators: unknown[]): unknown };
      source.pipe(debounceTime(asyncScheduler as never));
    `;
    const refused = migrateTestSchedulerSemantics(schedulerControl, { mode: 'cold', fileName: 'scheduler-control.ts' });
    expect(refused.status).toBe('refused');
    expect(refused.diagnostics).toEqual(
      expect.arrayContaining([expect.objectContaining({ code: 'scheduler-argument', disposition: 'refused' })])
    );

    const scenario = representativeAgentScenarios.find(({ id }) => id === 'library-weak-unsupported');
    expect(scenario).toMatchObject({ coverage: 'weak', targetContract: 'unsupported', expectedOutcome: 'safe-stop' });
    expect(scenario?.behavior.map(({ control }) => control.kind)).toContain('refusal');
    await expectMarkers('library-weak-unsupported', ['PT-WEAK-EXPORTS']);
  });
});

async function loadSeedModule<T>(scenarioId: string, relativePath: string): Promise<T> {
  const path = seedPath(scenarioId, relativePath);
  const source = await readFile(path, 'utf8');
  const code = ts.transpileModule(source, {
    compilerOptions: { esModuleInterop: true, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    fileName: path,
  }).outputText;
  const module = { exports: {} as Record<string, unknown> };
  const fixtureRequire = (specifier: string): unknown => {
    if (specifier === 'rxjs') return rxjs7;
    if (specifier === 'rxjs/operators') return rxjs7Operators;
    throw new Error(`The held-out seed attempted an undeclared import: ${specifier}`);
  };
  const execute = new Function('exports', 'require', 'module', '__filename', '__dirname', code);
  execute(module.exports, fixtureRequire, module, path, dirname(path));
  return module.exports as T;
}

async function expectMarkers(scenarioId: string, markers: readonly string[]): Promise<void> {
  const test = await seedSource(
    scenarioId,
    scenarioId === 'app-cold-strong'
      ? 'test/request.test-source.ts'
      : scenarioId === 'app-platform-strong'
      ? 'test/live-feed.test-source.ts'
      : 'test/index.test-source.ts'
  );
  for (const marker of markers) expect(test, `${scenarioId}:${marker}`).toContain(marker);
}

async function seedSource(scenarioId: string, relativePath: string): Promise<string> {
  return readFile(seedPath(scenarioId, relativePath), 'utf8');
}

function seedPath(scenarioId: string, relativePath: string): string {
  return join(packageRoot, 'test/agent/fixtures', scenarioId, 'seed', relativePath);
}
