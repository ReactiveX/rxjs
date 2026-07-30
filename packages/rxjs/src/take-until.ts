import { create } from './create.js';

export const takeUntil: unique symbol = Symbol('takeUntil');

declare global {
  interface Observable<T> {
    [takeUntil](notifier: ObservableValue<any>): Observable<T>;
  }
}

Observable.prototype[takeUntil] = function <T>(this: Observable<T>, notifier: ObservableValue<any>): Observable<T> {
  return this[create]((subscriber) => {
    let notifierSource: Observable<any>;
    try {
      notifierSource = Observable.from(notifier);
    } catch (error) {
      subscriber.error(error);
      return;
    }

    notifierSource.subscribe(
      {
        next: () => subscriber.complete(),
        error: (error) => subscriber.error(error),
      },
      { signal: subscriber.signal }
    );

    if (!subscriber.active) {
      return;
    }

    this.subscribe(
      {
        next: (value) => subscriber.next(value),
        error: (error) => subscriber.error(error),
        complete: () => subscriber.complete(),
      },
      { signal: subscriber.signal }
    );
  });
};
