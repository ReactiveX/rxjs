import { create } from './create.js';
import { isObservableInstance } from './util/ctor-helpers.js';
import { subscribeToSource } from './util/observable-helpers.js';
import type { ObservableArrayToValueUnion } from './util/types.js';

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
    let sourceIndex = 0;

    const subscribeNext = () => {
      if (sourceIndex === actualSources.length || active >= concurrency) {
        return;
      }

      const sourceValue = actualSources[sourceIndex++]!;
      let source: Observable<any>;

      try {
        source = Observable.from(sourceValue);
      } catch (error) {
        subscriber.error(error);
        return;
      }

      active++;
      subscribeToSource(source, subscriber, {
        complete: () => {
          active--;
          if (sourceIndex < actualSources.length) {
            subscribeNext();
          } else if (active === 0) {
            subscriber.complete();
          }
        },
      });

      if (active < concurrency) {
        subscribeNext();
      }
    };

    subscribeNext();
  });
}
