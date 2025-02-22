import { create } from './create.js';
import { isObservableInstance } from './util/ctor-helpers.js';
import { ObservableArrayToValueUnion } from './util/types';

export const merge: unique symbol = Symbol('merge');

declare global {
  interface ObservableCtor {
    [merge]: <Sources extends readonly ObservableValue<any>[]>(
      sources: Sources,
      config?: { concurrency?: number }
    ) => Observable<ObservableArrayToValueUnion<Sources>>;
  }

  interface Observable<T> {
    [merge]: <Sources extends readonly ObservableValue<any>[]>(
      sources: Sources,
      config?: { concurrency?: number }
    ) => Observable<T | ObservableArrayToValueUnion<Sources>>;
  }
}

Observable[merge] = mergeImpl;
Observable.prototype[merge] = mergeImpl;

function mergeImpl<T, Sources extends readonly ObservableValue<any>[]>(
  this: Observable<T> | ObservableCtor,
  sources: Sources,
  config?: { concurrency?: number }
): Observable<ObservableArrayToValueUnion<Sources>> {
  const actualSources = isObservableInstance(this) ? [this, ...sources] : sources;

  return this[create]((subscriber) => {
    const { concurrency = Infinity } = config ?? {};
    let active = 0;
    const next = (value: any) => subscriber.next(value);
    const error = (error: any) => subscriber.error(error);
    let sourceIndex = 0;

    const subscribeNext = () => {
      if (sourceIndex === actualSources.length || active >= concurrency) {
        return;
      }

      const sourceValue = actualSources[sourceIndex++];
      let source: Observable<any>;

      try {
        source = Observable.from(sourceValue);
      } catch (error) {
        subscriber.error(error);
        return;
      }

      active++;
      source.subscribe(
        {
          next,
          error,
          complete: () => {
            active--;
            if (sourceIndex < actualSources.length) {
              subscribeNext();
            } else if (active === 0) {
              subscriber.complete();
            }
          },
        },
        { signal: subscriber.signal }
      );

      if (active < concurrency) {
        subscribeNext();
      }
    };

    subscribeNext();
  });
}
