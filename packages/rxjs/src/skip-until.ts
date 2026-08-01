import { installObservableExtension } from './util/install-observable-extension.js';
import { create } from './create.js';

export const skipUntil: unique symbol = Symbol('skipUntil');

declare global {
  interface Observable<T> {
    [skipUntil]: (notifier: ObservableValue<any>) => Observable<T>;
  }
}

installObservableExtension({
  instance: function <T>(this: Observable<T>, notifier: ObservableValue<any>): Observable<T> {
    return this[create]((subscriber) => {
      let taking = false;
      const notifierController = new AbortController();
      subscriber.addTeardown(() => notifierController.abort(subscriber.signal.reason));

      let notifierSource: Observable<any>;
      try {
        notifierSource = Observable.from(notifier);
      } catch (error) {
        subscriber.error(error);
        return;
      }

      try {
        notifierSource.subscribe(
          {
            next: () => {
              notifierController.abort();
              taking = true;
            },
            error: (error) => subscriber.error(error),
          },
          { signal: notifierController.signal }
        );
      } catch (error) {
        subscriber.error(error);
      }

      if (!subscriber.active) {
        return;
      }

      this.subscribe(
        {
          next: (value) => {
            if (taking) {
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
  name: 'skipUntil',
  symbol: skipUntil,
});
