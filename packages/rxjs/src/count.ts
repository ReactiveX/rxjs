import { installObservableExtension } from './util/install-observable-extension.js';
import { create } from './create.js';

export const count: unique symbol = Symbol('count');

declare global {
  interface Observable<T> {
    [count]: (predicate?: (value: T, index: number) => boolean) => Observable<number>;
  }
}

installObservableExtension({
  instance: function <T>(this: Observable<T>, predicate?: (value: T, index: number) => boolean): Observable<number> {
    return this[create]((subscriber) => {
      let total = 0;
      let index = 0;

      this.subscribe(
        {
          next: (value) => {
            if (!predicate) {
              total++;
              return;
            }

            let matches: boolean;
            try {
              matches = predicate(value, index++);
            } catch (error) {
              subscriber.error(error);
              return;
            }

            if (matches) {
              total++;
            }
          },
          error: (error) => subscriber.error(error),
          complete: () => {
            subscriber.next(total);
            subscriber.complete();
          },
        },
        { signal: subscriber.signal }
      );
    });
  },
  name: 'count',
  symbol: count,
});
