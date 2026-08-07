import { create } from './create.js';
import { isObservableInstance } from './util/ctor-helpers.js';
import { subscribeToSource } from './util/observable-helpers.js';

export const combine: unique symbol = Symbol('combine');

declare global {
  interface CombineItem<T> {
    source: ObservableInput<T>;
    causesEmit?: boolean;
    requireFirstValue?: boolean;
  }

  interface ObservableCtor {
    [combine]: <Config extends readonly CombineItem<any>[]>(config: Config) => Observable<CombineValues<Config>>;
  }

  interface Observable<T> {
    [combine]: <Config extends readonly CombineItem<any>[]>(config: Config) => Observable<[T, ...CombineValues<Config>]>;
  }
}

type CombineValues<Sources extends readonly CombineItem<any>[]> = {
  [K in keyof Sources]: Sources[K] extends CombineItem<infer T> ? T : never;
};

interface CombineState {
  ready: boolean;
  value: any;
  complete: boolean;
  causesEmit: boolean;
}

Observable[combine] = combineImpl;
Observable.prototype[combine] = combineImpl;

function combineImpl<Config extends readonly CombineItem<any>[]>(
  this: ObservableCtor | Observable<any>,
  config: Config
): Observable<CombineValues<Config>> {
  const actualConfig: CombineItem<any>[] = isObservableInstance(this)
    ? [{ source: this, causesEmit: true, requireFirstValue: true }, ...config]
    : [...config];

  return this[create]((subscriber) => {
    const state: CombineState[] = actualConfig.map(({ causesEmit = true, requireFirstValue = true }) => ({
      causesEmit,
      ready: !requireFirstValue,
      value: undefined,
      complete: false,
    }));

    let allReady = state.every(({ ready }) => ready);

    for (let i = 0; i < actualConfig.length; i++) {
      const item = actualConfig[i]!;
      const itemState = state[i]!;
      subscribeToSource(Observable.from(item.source), subscriber, {
        next: (value) => {
          itemState.value = value;

          if (!allReady && !itemState.ready) {
            itemState.ready = true;
            allReady = state.every(({ ready }) => ready);
          }

          if (itemState.causesEmit && allReady) {
            subscriber.next(state.map(({ value }) => value) as any);
          }
        },
        complete: () => {
          itemState.complete = true;
          if (state.every(({ complete }) => complete)) {
            subscriber.complete();
          }
        },
      });
    }
  });
}

// BEGIN GENERATED FUNCTIONAL SURFACE

/**
 * Creates the pipeable `combineWith` form of the exact-Symbol `[combine]` capability.
 *
 * The source is supplied when the returned unary function is composed with
 * `rx`, `pipe`, or another function-composition helper. The result uses the same construction, error-forwarding, and AbortSignal cancellation behavior as the Symbol form.
 *
 * @returns A unary function that applies `[combine]` to its source.
 */
export function pipeableCombine<T, Config extends readonly CombineItem<any>[]>(config: Config): (source: Observable<T>) => Observable<[T, ...CombineValues<Config>]>;
export function pipeableCombine(...args: any[]): any {
  return (source: Observable<any>) => Reflect.apply(source[combine] as (...values: any[]) => any, source, args);
}

/**
 * Calls the static exact-Symbol `Observable[combine]` capability as an ordinary function.
 *
 * Construction, conversion, error forwarding, and cancellation remain owned
 * by the installed Symbol implementation.
 */
export function staticCombine<Config extends readonly CombineItem<any>[]>(config: Config): Observable<CombineValues<Config>>;
export function staticCombine(...args: any[]): any {
  return Reflect.apply(Observable[combine] as (...values: any[]) => any, Observable, args);
}

// END GENERATED FUNCTIONAL SURFACE
