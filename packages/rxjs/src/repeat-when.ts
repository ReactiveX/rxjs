import { create } from './create.js';
import { Subject } from './subject.js';
import { subscribeToSource } from './util/observable-helpers.js';

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

        subscribeToSource(source, subscriber, {
          complete: () => {
            awaitingRepeat = true;

            if (notifierComplete) {
              subscriber.complete();
              return;
            }

            if (!completions) {
              completions = new Subject<void>();

              const notifierResult = Observable.from(notifier(completions));
              subscribeToSource(notifierResult, subscriber, {
                next: () => {
                  if (awaitingRepeat && !sourceRequested && subscriber.active) {
                    requestSource();
                  }
                },
                complete: () => {
                  notifierComplete = true;
                  if (awaitingRepeat) {
                    subscriber.complete();
                  }
                },
              });
            }

            if (subscriber.active && !notifierComplete) {
              completions.next();
            }
          },
        });
        sourceSubscribeInProgress = false;
      } while (sourceRequested && subscriber.active);
    };

    requestSource();
  });
};
