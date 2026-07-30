import { create } from './create.js';
import { Subject } from './subject.js';

export const retryWhen: unique symbol = Symbol('retryWhen');

declare global {
  interface Observable<T> {
    [retryWhen](notifier: (errors: Observable<any>) => ObservableValue<any>): Observable<T>;
  }
}

Observable.prototype[retryWhen] = function <T>(
  this: Observable<T>,
  notifier: (errors: Observable<any>) => ObservableValue<any>
): Observable<T> {
  const source = this;

  return source[create]((subscriber) => {
    let errors: Subject<any> | undefined;
    let pendingAttempts = 1;
    let draining = false;

    function requestAttempt(): void {
      if (!subscriber.active) {
        return;
      }

      pendingAttempts++;
      drainAttempts();
    }

    function startNotifier(): Subject<any> | undefined {
      const errorStream = new Subject<any>();
      let notifierInput: ObservableValue<any>;

      try {
        notifierInput = notifier(errorStream);
      } catch (error) {
        subscriber.error(error);
        return undefined;
      }

      let notifierSource: Observable<any>;
      try {
        notifierSource = Observable.from(notifierInput);
      } catch (error) {
        subscriber.error(error);
        return undefined;
      }

      try {
        notifierSource.subscribe(
          {
            next: requestAttempt,
            error: (error) => subscriber.error(error),
            complete: () => subscriber.complete(),
          },
          { signal: subscriber.signal }
        );
      } catch (error) {
        subscriber.error(error);
        return undefined;
      }

      return subscriber.active ? errorStream : undefined;
    }

    function startAttempt(): void {
      const sourceController = new AbortController();
      let sourceTerminated = false;

      const handleSourceError = (error: any): void => {
        if (sourceTerminated) {
          return;
        }

        sourceTerminated = true;
        sourceController.abort();
        if (!subscriber.active) {
          return;
        }

        errors ??= startNotifier();
        errors?.next(error);
      };

      try {
        source.subscribe(
          {
            next: (value) => subscriber.next(value),
            error: handleSourceError,
            complete: () => {
              if (!sourceTerminated) {
                sourceTerminated = true;
                subscriber.complete();
              }
            },
          },
          { signal: AbortSignal.any([subscriber.signal, sourceController.signal]) }
        );
      } catch (error) {
        handleSourceError(error);
      }
    }

    function drainAttempts(): void {
      if (draining || !subscriber.active) {
        return;
      }

      draining = true;
      try {
        while (pendingAttempts > 0 && subscriber.active) {
          pendingAttempts--;
          startAttempt();
        }
      } finally {
        draining = false;
      }
    }

    drainAttempts();
  });
};
