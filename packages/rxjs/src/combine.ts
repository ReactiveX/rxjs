// COPYRIGHT (c) 2025 Ben Lesh <ben@benlesh.com> All rights reserved
import { create } from './create.js';
import { isObservableInstance } from './util/ctor-helpers.js';

export const combine: unique symbol = Symbol('combine');

declare global {
  interface CombineItem<T> {
    source: ObservableValue<T>;
    causesEmit?: boolean;
    requireFirstValue?: boolean;
  }

  interface ObservableCtor {
    [combine]: <Config extends readonly CombineItem<any>[]>(
      config: Config
    ) => Observable<CombineValues<Config>>;
  }

  interface Observable<T> {
    [combine]: <Config extends readonly CombineItem<any>[]>(
      config: Config
    ) => Observable<[T, ...CombineValues<Config>]>;
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
    const state: CombineState[] = actualConfig.map(
      ({ causesEmit = true, requireFirstValue = true }) => ({
        causesEmit,
        ready: !requireFirstValue,
        value: undefined,
        complete: false,
      })
    );

    let allReady = state.every(({ ready }) => ready);

    for (let i = 0; i < actualConfig.length; i++) {
      Observable.from(actualConfig[i].source).subscribe(
        {
          next: (value) => {
            const itemState = state[i];
            itemState.value = value;

            if (!allReady && !itemState.ready) {
              itemState.ready = true;
              allReady = state.every(({ ready }) => ready);
            }

            if (itemState.causesEmit && allReady) {
              subscriber.next(state.map(({ value }) => value) as any);
            }
          },
          error: (error) => subscriber.error(error),
          complete: () => {
            state[i].complete = true;
            if (state.every(({ complete }) => complete)) {
              subscriber.complete();
            }
          },
        },
        { signal: subscriber.signal }
      );
    }
  });
}
