import { create } from './create.js';
import { Subject } from './subject.js';

export const repeatWhen: unique symbol = Symbol('repeatWhen');

declare global {
  interface Observable<T> {
    [repeatWhen](notifier: (completions: Observable<void>) => ObservableValue<unknown>): Observable<T>;
  }
}

Observable.prototype[repeatWhen] = function <T>(
  this: Observable<T>,
  notifier: (completions: Observable<void>) => ObservableValue<unknown>
): Observable<T> {
  const source = this;

  return source[create]<T>((subscriber) => {
    let completions: Subject<void> | undefined;
    let notifierComplete = false;
    let awaitingRepeat = false;
    let sourceSubscribeInProgress = false;
    let sourceRequested = false;

    const requestSource = (): void => {
      if (!subscriber.active) {
        return;
      }

      sourceRequested = true;
      if (sourceSubscribeInProgress) {
        return;
      }

      do {
        sourceRequested = false;
        sourceSubscribeInProgress = true;
        awaitingRepeat = false;

        try {
          source.subscribe(
            {
              next: (value) => subscriber.next(value),
              error: (error) => subscriber.error(error),
              complete: () => {
                awaitingRepeat = true;

                if (notifierComplete) {
                  subscriber.complete();
                  return;
                }

                if (!completions) {
                  completions = new Subject<void>();

                  let notifierInput: ObservableValue<unknown>;
                  try {
                    notifierInput = notifier(completions);
                  } catch (error) {
                    subscriber.error(error);
                    return;
                  }

                  let notifierResult: Observable<unknown>;
                  try {
                    notifierResult = Observable.from(notifierInput);
                  } catch (error) {
                    subscriber.error(error);
                    return;
                  }

                  try {
                    notifierResult.subscribe(
                      {
                        next: () => {
                          if (awaitingRepeat && !sourceRequested && subscriber.active) {
                            requestSource();
                          }
                        },
                        error: (error) => subscriber.error(error),
                        complete: () => {
                          notifierComplete = true;
                          if (awaitingRepeat) {
                            subscriber.complete();
                          }
                        },
                      },
                      { signal: subscriber.signal }
                    );
                  } catch (error) {
                    subscriber.error(error);
                    return;
                  }
                }

                if (subscriber.active && !notifierComplete) {
                  completions.next();
                }
              },
            },
            { signal: subscriber.signal }
          );
        } catch (error) {
          subscriber.error(error);
        } finally {
          sourceSubscribeInProgress = false;
        }
      } while (sourceRequested && subscriber.active);
    };

    requestSource();
  });
};
