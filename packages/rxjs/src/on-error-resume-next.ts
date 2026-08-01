import { installObservableExtension } from './util/install-observable-extension.js';
import { create } from './create.js';
import '@rxjs/observable-polyfill';
import { isObservableInstance } from './util/ctor-helpers.js';
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

installObservableExtension({
  instance: onErrorResumeNextImpl,
  static: onErrorResumeNextImpl,
  name: 'onErrorResumeNext',
  symbol: onErrorResumeNext,
});

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
      source.subscribe(
        {
          next: (value: any) => {
            subscriber.next(value);
          },
          error: subscribeNext,
          complete: subscribeNext,
        },
        { signal: subscriber.signal }
      );
    };

    subscribeNext();
  });
}
