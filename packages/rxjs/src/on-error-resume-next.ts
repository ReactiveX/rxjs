import { create } from './create.js';
import '@rxjs/observable-polyfill';
import { isObservableInstance } from './util/ctor-helpers.js';
import { subscribeToSource } from './util/observable-helpers.js';
import type { ObservableArrayToValueUnion } from './util/types.js';

export const onErrorResumeNext: unique symbol = Symbol('onErrorResumeNext');

declare global {
  interface ObservableCtor {
    [onErrorResumeNext]: <Sources extends readonly ObservableValue<any>[]>(
      sources: Sources
    ) => Observable<ObservableArrayToValueUnion<Sources>>;
  }

  interface Observable<T> {
    [onErrorResumeNext]: <Sources extends readonly ObservableValue<any>[]>(
      sources: Sources
    ) => Observable<T | ObservableArrayToValueUnion<Sources>>;
  }
}

Observable[onErrorResumeNext] = onErrorResumeNextImpl;
Observable.prototype[onErrorResumeNext] = onErrorResumeNextImpl;

function onErrorResumeNextImpl<Sources extends readonly ObservableValue<any>[]>(
  this: ObservableCtor | Observable<any>,
  sources: Sources
): Observable<ObservableArrayToValueUnion<Sources>> {
  const actualSources: readonly ObservableValue<any>[] = isObservableInstance(this) ? [this, ...sources] : sources;

  return this[create]((subscriber) => {
    let currentSourceIndex = 0;

    const subscribeNext = () => {
      if (!subscriber.active) {
        return;
      }
      if (currentSourceIndex >= actualSources.length) {
        subscriber.complete();
        return;
      }

      const source = Observable.from(actualSources[currentSourceIndex++]!);
      subscribeToSource(source, subscriber, {
        next: (value: any) => subscriber.next(value),
        error: subscribeNext,
        complete: subscribeNext,
      });
    };

    subscribeNext();
  });
}
