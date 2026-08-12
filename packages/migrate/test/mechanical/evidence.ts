import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { MechanicalFixture } from './fixtures.js';

export const rxjs7Version = '7.8.1';

const repositoryRoot = fileURLToPath(new URL('../../../../', import.meta.url));
const rxjs7Root = `${repositoryRoot}node_modules/.pnpm/rxjs@${rxjs7Version}/node_modules/rxjs`;
const require = createRequire(import.meta.url);

interface Rxjs7Observable<T> {
  pipe<R>(operator: (source: Rxjs7Observable<T>) => Rxjs7Observable<R>): Rxjs7Observable<R>;
  subscribe(observer: {
    next(value: T): void;
    error(error: unknown): void;
    complete(): void;
  }): { unsubscribe(): void };
}

type Rxjs7Operator<T, R> = (source: Rxjs7Observable<T>) => Rxjs7Observable<R>;

interface Rxjs7Runtime {
  of<T>(...values: T[]): Rxjs7Observable<T>;
}

interface Rxjs7Operators {
  bufferCount<T>(size: number, startEvery?: number): Rxjs7Operator<T, T[]>;
  concatMap<T, R>(project: (value: T) => Rxjs7Observable<R>): Rxjs7Operator<T, R>;
  map<T, R>(project: (value: T) => R): Rxjs7Operator<T, R>;
}

/**
 * Loads the exact RxJS 7 package already pinned in the workspace lockfile.
 * Keeping this path/version explicit prevents a workspace self-link to RxJS
 * Next from accidentally masquerading as source-version evidence.
 */
export function loadPinnedRxjs7(): { readonly runtime: Rxjs7Runtime; readonly operators: Rxjs7Operators } {
  const packageJson = JSON.parse(readFileSync(`${rxjs7Root}/package.json`, 'utf8')) as { version?: unknown };
  if (packageJson.version !== rxjs7Version) {
    throw new Error(`Expected the pinned RxJS ${rxjs7Version} evidence package, received ${String(packageJson.version)}.`);
  }

  return {
    runtime: require(rxjs7Root) as Rxjs7Runtime,
    operators: require(`${rxjs7Root}/operators`) as Rxjs7Operators,
  };
}

export function collectRxjs7Sync<T>(source: Rxjs7Observable<T>): T[] {
  const values: T[] = [];
  let failure: unknown;
  source.subscribe({
    next: (value) => values.push(value),
    error: (error) => {
      failure = error;
    },
    complete: () => undefined,
  });
  if (failure !== undefined) throw failure;
  return values;
}

export function sourceTypeEvidence(fixture: MechanicalFixture): string {
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

export function targetTypeEvidence(fixture: MechanicalFixture, target: string): string {
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

export function rxjs7TypePaths(): Record<string, string[]> {
  const relativeRoot = `node_modules/.pnpm/rxjs@${rxjs7Version}/node_modules/rxjs/dist/types`;
  return {
    rxjs: [`${relativeRoot}/index.d.ts`],
    'rxjs/operators': [`${relativeRoot}/operators/index.d.ts`],
  };
}

export function rxjsNextTypePaths(): Record<string, string[]> {
  return {
    rxjs: ['packages/rxjs/src/index.ts'],
    'rxjs/*': ['packages/rxjs/src/*.ts'],
    '@rxjs/observable-polyfill': ['packages/observable-polyfill/src/index.ts'],
  };
}

function sourceValueType(fixtureId: string, observableName: 'Observable' | 'ColdObservable'): string {
  switch (fixtureId) {
    case 'operator.concat-all':
    case 'operator.switch-all':
      return `${observableName}<${observableName}<number>>`;
    default:
      return `${observableName}<number>`;
  }
}
