import { combine } from './combine.js';
import { map } from './map.js';
import { isObservableInstance } from './util/ctor-helpers.js';

type CombineLatestValues<Sources extends readonly ObservableInput<any>[] | { [key: string]: ObservableInput<any> }> = {
  [K in keyof Sources]: Sources[K] extends ObservableInput<infer T> ? T : never;
};

type CombineLatestArrayValues<Sources extends readonly ObservableInput<any>[]> = {
  [K in keyof Sources]: Sources[K] extends ObservableInput<infer T> ? T : never;
};

export const combineLatest: unique symbol = Symbol('combineLatest');

declare global {
  interface ObservableCtor {
    [combineLatest]: {
      <Sources extends readonly ObservableInput<any>[] | { [key: string]: ObservableInput<any> }>(
        sources: Sources,
        config?: { requireAllValues?: boolean }
      ): Observable<CombineLatestValues<Sources>>;
      <Sources extends readonly ObservableInput<any>[], Result>(
        sources: Sources,
        project: (...values: CombineLatestArrayValues<Sources>) => Result
      ): Observable<Result>;
    };
  }

  interface Observable<T> {
    [combineLatest]: {
      <Sources extends readonly ObservableInput<any>[]>(sources: Sources, config?: { requireAllValues?: boolean }): Observable<
        [T, ...CombineLatestArrayValues<Sources>]
      >;
      <Sources extends readonly ObservableInput<any>[], Result>(
        sources: Sources,
        project: (value: T, ...values: CombineLatestArrayValues<Sources>) => Result
      ): Observable<Result>;
    };
  }
}

Observable[combineLatest] = combineLatestImpl;
Observable.prototype[combineLatest] = combineLatestImpl;

function combineLatestImpl<Sources extends readonly ObservableInput<any>[] | { [key: string]: ObservableInput<any> }>(
  this: ObservableCtor | Observable<any>,
  sources: Sources,
  configOrProject?: { requireAllValues?: boolean } | ((...values: any[]) => any)
): Observable<CombineLatestValues<Sources> | any> {
  const project = typeof configOrProject === 'function' ? configOrProject : undefined;
  const config = typeof configOrProject === 'object' && configOrProject !== null ? configOrProject : {};
  const { requireAllValues = true } = config;

  if (isObservableInstance(this)) {
    if (!Array.isArray(sources)) {
      throw new TypeError('Must combine observable instance with an array of observable values');
    }
    const combined = this[combine](
      sources.map((source) => ({
        source,
        requireFirstValue: requireAllValues,
      }))
    );
    return project === undefined ? (combined as any) : combined[map]((values) => project(...values));
  }

  const actualSources: readonly ObservableInput<any>[] | { [key: string]: ObservableInput<any> } = Array.isArray(sources)
    ? [...sources]
    : { ...sources };

  if (isSourceArray(actualSources)) {
    const combined = this[combine](
      actualSources.map((source) => ({
        source,
        requireFirstValue: requireAllValues,
      }))
    );
    return project === undefined ? (combined as any) : combined[map]((values) => project(...values));
  } else {
    if (project !== undefined) {
      throw new TypeError('A combineLatest projection requires an array of observable values');
    }
    const keys = Object.keys(actualSources);

    return this[combine](
      keys.map((key) => ({
        source: actualSources[key]!,
        requireFirstValue: requireAllValues,
      }))
    )[map]((values) => Object.fromEntries(keys.map((key, i) => [key, values[i]]))) as any;
  }
}

function isSourceArray(sources: any): sources is readonly ObservableInput<any>[] {
  return Array.isArray(sources);
}

// BEGIN GENERATED FUNCTIONAL SURFACE

/**
 * Creates the pipeable `combineLatestWith` form of the exact-Symbol `[combineLatest]` capability.
 *
 * The source is supplied when the returned unary function is composed with
 * `rx`, `pipe`, or another function-composition helper. The result uses the same construction, error-forwarding, and AbortSignal cancellation behavior as the Symbol form.
 *
 * @returns A unary function that applies `[combineLatest]` to its source.
 */
export function pipeableCombineLatest<T, Sources extends readonly ObservableInput<any>[]>(sources: Sources, config?: { requireAllValues?: boolean }): (source: Observable<T>) => Observable<
        [T, ...CombineLatestArrayValues<Sources>]
      >;
export function pipeableCombineLatest<T, Sources extends readonly ObservableInput<any>[], Result>(sources: Sources, project: (value: T, ...values: CombineLatestArrayValues<Sources>) => Result): (source: Observable<T>) => Observable<Result>;
export function pipeableCombineLatest(...args: any[]): any {
  return (source: Observable<any>) => Reflect.apply(source[combineLatest] as (...values: any[]) => any, source, args);
}

/**
 * Calls the static exact-Symbol `Observable[combineLatest]` capability as an ordinary function.
 *
 * Construction, conversion, error forwarding, and cancellation remain owned
 * by the installed Symbol implementation.
 */
export function staticCombineLatest<Sources extends readonly ObservableInput<any>[] | { [key: string]: ObservableInput<any> }>(sources: Sources, config?: { requireAllValues?: boolean }): Observable<CombineLatestValues<Sources>>;
export function staticCombineLatest<Sources extends readonly ObservableInput<any>[], Result>(sources: Sources, project: (...values: CombineLatestArrayValues<Sources>) => Result): Observable<Result>;
export function staticCombineLatest(...args: any[]): any {
  return Reflect.apply(Observable[combineLatest] as (...values: any[]) => any, Observable, args);
}

// END GENERATED FUNCTIONAL SURFACE
