import { combine } from './combine';
import { isObservableInstance } from './util/ctor-helpers.js';

type CombineLatestValues<Sources extends readonly ObservableValue<any>[] | { [key: string]: ObservableValue<any> }> = {
  [K in keyof Sources]: Sources[K] extends ObservableValue<infer T> ? T : never;
};

export const combineLatest: unique symbol = Symbol('combineLatest');

declare global {
  interface ObservableCtor {
    [combineLatest]: <Sources extends readonly ObservableValue<any>[] | { [key: string]: ObservableValue<any> }>(
      sources: Sources,
      config?: { requireAllValues?: boolean }
    ) => Observable<CombineLatestValues<Sources>>;
  }

  interface Observable<T> {
    [combineLatest]: <Sources extends readonly ObservableValue<any>[]>(
      sources: Sources,
      config?: { requireAllValues?: boolean }
    ) => Observable<CombineLatestValues<[ObservableValue<T>, ...Sources]>>;
  }
}

Observable[combineLatest] = combineLatestImpl;
Observable.prototype[combineLatest] = combineLatestImpl;

function combineLatestImpl<Sources extends readonly ObservableValue<any>[] | { [key: string]: ObservableValue<any> }>(
  this: ObservableCtor | Observable<any>,
  sources: Sources,
  config?: { requireAllValues?: boolean }
): Observable<CombineLatestValues<Sources>> {
  const { requireAllValues = true } = config ?? {};

  let actualSources: readonly ObservableValue<any>[] | { [key: string]: ObservableValue<any> };

  if (isObservableInstance(this)) {
    if (!Array.isArray(sources)) {
      throw new TypeError('Must combine observable instance with an array of observable values');
    }
    actualSources = [this, ...sources];
  } else {
    actualSources = Array.isArray(sources) ? [...sources] : { ...sources };
  }

  if (isSourceArray(actualSources)) {
    return this[combine](
      actualSources.map((source) => ({
        source,
        requireFirstValue: requireAllValues,
      }))
    ) as any;
  } else {
    const keys = Object.keys(actualSources);

    return this[combine](
      keys.map((key) => ({
        source: actualSources[key],
        requireFirstValue: requireAllValues,
      }))
    ).map((values) => Object.fromEntries(keys.map((key, i) => [key, values[i]]))) as any;
  }
}

function isSourceArray(sources: any): sources is readonly ObservableValue<any>[] {
  return Array.isArray(sources);
}
