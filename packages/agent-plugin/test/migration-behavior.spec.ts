import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';
import '@rxjs/observable-polyfill';
import { of as rxjs7Of } from 'rxjs7';
import { bufferCount as rxjs7BufferCount, concatMap as rxjs7ConcatMap, map as rxjs7Map } from 'rxjs7/operators';
import { buffer } from '../../rxjs/src/buffer.js';
import { ColdObservable } from '../../rxjs/src/cold-observable.js';
import { map } from '../../rxjs/src/map.js';
import { mergeMap } from '../../rxjs/src/merge-map.js';
import { migrateTestSource } from '../src/migration/index.js';
import { mechanicalFixtures, type MechanicalFixture } from './migration/fixtures.js';

const repositoryRoot = fileURLToPath(new URL('../../../', import.meta.url));

describe('migration behavior parity with pinned RxJS 7.8.2', () => {
  it('preserves mapped values', () => {
    requireClaim('map-values');
    const source = collectRxjs7Sync(rxjs7Of(1, 2, 3).pipe(rxjs7Map((value) => value + 1)));
    const target = collectSync(fromValues(1, 2, 3)[map]((value) => value + 1));
    expect(target).toEqual(source);
  });

  it('preserves count-buffer values and completion remainder', () => {
    requireClaim('buffer-count-values');
    const source = collectRxjs7Sync(rxjs7Of(1, 2, 3).pipe(rxjs7BufferCount(2)));
    const target = collectSync(
      fromValues(1, 2, 3)[buffer]({ maxSize: 2, startEvery: 2, emitRemainingOnError: false })
    );
    expect(target).toEqual(source);
  });

  it('preserves concatMap ordering for synchronous inner work', () => {
    requireClaim('concat-map-values');
    const source = collectRxjs7Sync(rxjs7Of(1, 2).pipe(rxjs7ConcatMap((value) => rxjs7Of(value, value * 10))));
    const target = collectSync(fromValues(1, 2)[mergeMap]((value) => fromValues(value, value * 10), { concurrent: 1 }));
    expect(target).toEqual(source);
  });

  it('detects behavior drift in its negative control', () => {
    const source = collectRxjs7Sync(rxjs7Of(1, 2, 3).pipe(rxjs7Map((value) => value + 1)));
    const drifted = collectSync(fromValues(1, 2, 3)[map]((value) => value + 2));
    expect(drifted).not.toEqual(source);
  });
});

describe('migration source and target type evidence', () => {
  for (const fixture of mechanicalFixtures.filter(({ category }) => category === 'operator')) {
    it(`${fixture.id} compiles against pinned RxJS 7.8.2 source types`, () => {
      expect(formatDiagnostics(typecheck(`${fixture.id}.source.ts`, sourceTypeEvidence(fixture), rxjs7TypePaths()))).toBe('');
    });

    it(`${fixture.id} output compiles against current RxJS 9 types`, () => {
      const result = migrateTestSource(fixture.input, { fileName: fixture.fileName });
      expect(result.status).toBe('changed');
      expect(formatDiagnostics(typecheck(`${fixture.id}.target.ts`, targetTypeEvidence(fixture, result.code), rxjs9TypePaths()))).toBe('');
    });
  }

  it('detects a target type regression in its negative control', () => {
    const diagnostics = typecheck(
      'negative.target-type-regression.ts',
      [
        "import { ColdObservable } from 'rxjs/cold-observable';",
        "import { map } from 'rxjs/map';",
        'declare const source: ColdObservable<number>;',
        'const result: Observable<number> = source[map](value => value.toFixed());',
      ].join('\n'),
      rxjs9TypePaths()
    );
    expect(diagnostics.some(({ code }) => code === 2322)).toBe(true);
  });
});

function requireClaim(claim: NonNullable<MechanicalFixture['behaviorClaim']>): void {
  expect(mechanicalFixtures.some(({ behaviorClaim }) => behaviorClaim === claim)).toBe(true);
}

function fromValues<T>(...values: readonly T[]): ColdObservable<T> {
  return new ColdObservable((subscriber) => {
    for (const value of values) subscriber.next(value);
    subscriber.complete();
  });
}

function collectSync<T>(source: Observable<T>): T[] {
  const values: T[] = [];
  let failure: unknown;
  source.subscribe({
    next: (value) => values.push(value),
    error: (error) => {
      failure = error;
    },
  });
  if (failure !== undefined) throw failure;
  return values;
}

function collectRxjs7Sync<T>(source: import('rxjs7').Observable<T>): T[] {
  const values: T[] = [];
  let failure: unknown;
  source.subscribe({
    next: (value) => values.push(value),
    error: (error) => {
      failure = error;
    },
  });
  if (failure !== undefined) throw failure;
  return values;
}

function sourceTypeEvidence(fixture: MechanicalFixture): string {
  const sourceType = sourceValueType(fixture.id, 'Observable');
  return [
    "import { Observable } from 'rxjs';",
    `declare const source: ${sourceType};`,
    'declare const notifier: Observable<unknown>;',
    'declare function inner(value: number): Observable<number>;',
    'declare function duration(value: number): Observable<unknown>;',
    fixture.input,
  ].join('\n');
}

function targetTypeEvidence(fixture: MechanicalFixture, target: string): string {
  const sourceType = sourceValueType(fixture.id, 'ColdObservable');
  return [
    "import { ColdObservable } from 'rxjs/cold-observable';",
    `declare const source: ${sourceType};`,
    'declare const notifier: ColdObservable<unknown>;',
    'declare function inner(value: number): ColdObservable<number>;',
    'declare function duration(value: number): ColdObservable<unknown>;',
    target,
  ].join('\n');
}

function sourceValueType(fixtureId: string, observableName: 'Observable' | 'ColdObservable'): string {
  return fixtureId === 'operator.concat-all' || fixtureId === 'operator.switch-all'
    ? `${observableName}<${observableName}<number>>`
    : `${observableName}<number>`;
}

function rxjs7TypePaths(): Record<string, string[]> {
  const root = `${repositoryRoot}packages/agent-plugin/node_modules/rxjs7/dist/types`;
  return { rxjs: [`${root}/index.d.ts`], 'rxjs/operators': [`${root}/operators/index.d.ts`] };
}

function rxjs9TypePaths(): Record<string, string[]> {
  return {
    rxjs: [`${repositoryRoot}packages/rxjs/src/index.ts`],
    'rxjs/*': [`${repositoryRoot}packages/rxjs/src/*.ts`],
    '@rxjs/observable-polyfill': [`${repositoryRoot}packages/observable-polyfill/src/index.ts`],
  };
}

function typecheck(fileName: string, source: string, paths: Record<string, string[]>): readonly ts.Diagnostic[] {
  const virtualFileName = `${repositoryRoot}.cache/agent-plugin-migration/${fileName.replace(/\.ts$/, '.mts')}`;
  const options: ts.CompilerOptions = {
    baseUrl: repositoryRoot,
    lib: ['lib.esnext.d.ts', 'lib.dom.d.ts'],
    module: ts.ModuleKind.NodeNext,
    moduleResolution: ts.ModuleResolutionKind.NodeNext,
    noEmit: true,
    noUncheckedIndexedAccess: true,
    paths,
    skipLibCheck: true,
    strict: true,
    target: ts.ScriptTarget.ESNext,
  };
  const host = ts.createCompilerHost(options);
  const readSourceFile = host.getSourceFile.bind(host);
  host.getSourceFile = (candidate, languageVersion, onError, shouldCreateNewSourceFile) =>
    candidate === virtualFileName
      ? ts.createSourceFile(candidate, source, languageVersion, true, ts.ScriptKind.TS)
      : readSourceFile(candidate, languageVersion, onError, shouldCreateNewSourceFile);
  host.fileExists = ((fileExists) => (candidate) => candidate === virtualFileName || fileExists(candidate))(host.fileExists.bind(host));
  host.readFile = ((read) => (candidate) => (candidate === virtualFileName ? source : read(candidate)))(host.readFile.bind(host));
  return ts.getPreEmitDiagnostics(ts.createProgram([virtualFileName], options, host));
}

function formatDiagnostics(diagnostics: readonly ts.Diagnostic[]): string {
  return ts.formatDiagnosticsWithColorAndContext(diagnostics, {
    getCanonicalFileName: (fileName) => fileName,
    getCurrentDirectory: () => repositoryRoot,
    getNewLine: () => '\n',
  });
}
