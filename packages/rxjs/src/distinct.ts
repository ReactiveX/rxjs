import { installObservableExtension } from './util/install-observable-extension.js';
import { create } from './create.js';

export const distinct: unique symbol = Symbol('distinct');

declare global {
  interface Observable<T> {
    [distinct]: <K = T>(keySelector?: (value: T) => K, flushes?: ObservableValue<any>) => Observable<T>;
  }
}

installObservableExtension({
  instance: function <T, K = T>(this: Observable<T>, keySelector?: (value: T) => K, flushes?: ObservableValue<any>): Observable<T> {
    return this[create]((subscriber) => {
      const keys = new Set<K | T>();

      this.subscribe(
        {
          next: (value) => {
            let key: K | T;
            try {
              key = keySelector ? keySelector(value) : value;
            } catch (error) {
              subscriber.error(error);
              return;
            }

            if (!keys.has(key)) {
              keys.add(key);
              subscriber.next(value);
            }
          },
          error: (error) => subscriber.error(error),
          complete: () => subscriber.complete(),
        },
        { signal: subscriber.signal }
      );

      if (!subscriber.active || !flushes) {
        return;
      }

      let flushSource: Observable<any>;
      try {
        flushSource = Observable.from(flushes);
      } catch (error) {
        subscriber.error(error);
        return;
      }

      flushSource.subscribe(
        {
          next: () => keys.clear(),
          error: (error) => subscriber.error(error),
        },
        { signal: subscriber.signal }
      );
    });
  },
  name: 'distinct',
  symbol: distinct,
});
