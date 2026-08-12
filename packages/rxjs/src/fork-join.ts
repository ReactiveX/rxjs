import { create } from './create.js';
import { subscribeToSource } from './util/observable-helpers.js';

declare const anyCatcher: unique symbol;
type AnyCatcher = typeof anyCatcher;
type ObservedValueOf<Input> = Input extends ObservableValue<infer Value> ? Value : never;
type ForkJoinTuple<Sources extends readonly ObservableValue<any>[]> = {
  -readonly [K in keyof Sources]: ObservedValueOf<Sources[K]>;
};
type ForkJoinObject<Sources extends Record<string, ObservableValue<any>>> = {
  [K in keyof Sources]: ObservedValueOf<Sources[K]>;
};

interface ForkJoinMethod {
  <T extends AnyCatcher>(arg: T): Observable<unknown>;
  (): Observable<never>;
  (sources: readonly []): Observable<never>;
  <const Sources extends readonly ObservableValue<any>[]>(sources: Sources): Observable<ForkJoinTuple<Sources>>;
  <const Sources extends readonly ObservableValue<any>[], Result>(
    sources: Sources,
    resultSelector: (...values: ForkJoinTuple<Sources>) => Result
  ): Observable<Result>;
  (sourcesObject: Record<string, never>): Observable<never>;
  <Sources extends Record<string, ObservableValue<any>>>(sourcesObject: Sources): Observable<ForkJoinObject<Sources>>;
  (source: null | undefined): Observable<never>;
  <const Sources extends readonly ObservableValue<any>[]>(...sources: Sources): Observable<ForkJoinTuple<Sources>>;
  <const Sources extends readonly ObservableValue<any>[], Result>(
    ...sourcesAndResultSelector: [...Sources, (...values: ForkJoinTuple<Sources>) => Result]
  ): Observable<Result>;
}

export const forkJoin: unique symbol = Symbol('forkJoin');

declare global {
  interface ObservableCtor {
    [forkJoin]: ForkJoinMethod;
  }
}

function forkJoinImpl(this: ObservableCtor, ...inputArguments: any[]): Observable<any> {
  const resultSelector =
    typeof inputArguments[inputArguments.length - 1] === 'function' ? (inputArguments.pop() as (...values: any[]) => any) : undefined;
  const { keys, sources } = normalizeInputs(inputArguments);
  const ObservableCtor = this;

  return ObservableCtor[create]((subscriber) => {
    const sourceCount = sources.length;
    if (sourceCount === 0) {
      subscriber.complete();
      return;
    }

    const values = new Array<any>(sourceCount);
    let remainingCompletions = sourceCount;
    let remainingEmissions = sourceCount;

    for (let index = 0; index < sourceCount && subscriber.active; index++) {
      let hasValue = false;
      let input: Observable<any>;

      try {
        input = ObservableCtor.from(sources[index]);
      } catch (error) {
        subscriber.error(error);
        break;
      }

      subscribeToSource(input, subscriber, {
        next: (value) => {
          if (!hasValue) {
            hasValue = true;
            remainingEmissions--;
          }
          values[index] = value;
        },
        complete: () => {
          remainingCompletions--;

          if (!hasValue) {
            subscriber.complete();
            return;
          }

          if (remainingCompletions === 0) {
            let result: any = keys ? createResultObject(keys, values) : values;

            if (resultSelector) {
              result = keys ? resultSelector(result) : resultSelector(...values);
            }

            if (remainingEmissions === 0) {
              subscriber.next(result);
            }
            subscriber.complete();
          }
        },
      });
    }
  });
}

Observable[forkJoin] = forkJoinImpl as ForkJoinMethod;

function normalizeInputs(inputArguments: any[]): {
  readonly keys: string[] | null;
  readonly sources: readonly any[];
} {
  if (inputArguments.length === 1) {
    const first = inputArguments[0];
    if (Array.isArray(first)) {
      return { keys: null, sources: first };
    }
    if (isPlainObject(first)) {
      const keys = Object.keys(first);
      return {
        keys,
        sources: keys.map((key) => first[key]),
      };
    }
  }

  return { keys: null, sources: inputArguments };
}

function isPlainObject(value: any): value is Record<string, any> {
  return value != null && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype;
}

function createResultObject(keys: readonly string[], values: readonly any[]): Record<string, any> {
  const result: Record<string, any> = {};
  for (let index = 0; index < keys.length; index++) {
    result[keys[index]!] = values[index];
  }
  return result;
}
