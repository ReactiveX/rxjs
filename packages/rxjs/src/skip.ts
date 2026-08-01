import { installObservableExtension } from './util/install-observable-extension.js';
import { create } from './create.js';

export const skip: unique symbol = Symbol('skip');

declare global {
  interface Observable<T> {
    [skip]: (count: number) => Observable<T>;
  }
}

installObservableExtension({
  instance: function <T>(this: Observable<T>, count: number): Observable<T> {
    return this[create]((subscriber) => {
      let index = 0;

      this.subscribe(
        {
          next: (value) => {
            if (count <= index++) {
              subscriber.next(value);
            }
          },
          error: (error) => subscriber.error(error),
          complete: () => subscriber.complete(),
        },
        { signal: subscriber.signal }
      );
    });
  },
  name: 'skip',
  symbol: skip,
});
