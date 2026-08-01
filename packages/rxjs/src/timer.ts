import { installObservableExtension } from './util/install-observable-extension.js';
import { createDerivedObservable } from './util/observable-helpers.js';

export const timer: unique symbol = Symbol('timer');

declare global {
  interface ObservableCtor {
    [timer]: {
      (delay: number): Observable<number>;
      (delay: number, interval: number): Observable<number>;
    };
  }
}

function timerFactory(this: ObservableCtor, delay: number, interval?: number): Observable<number> {
  return createDerivedObservable({
    receiver: this,
    init: (subscriber) => {
      let n = 0;

      let id = globalThis.setInterval(() => {
        subscriber.next(n++);

        if (interval == null || interval < 0) {
          subscriber.complete();
        } else if (interval !== delay) {
          globalThis.clearInterval(id);
          id = globalThis.setInterval(() => {
            subscriber.next(n++);
          });
        }
      }, delay);

      subscriber.addTeardown(() => globalThis.clearInterval(id));
    },
  });
}

installObservableExtension({ name: 'timer', static: timerFactory, symbol: timer });
