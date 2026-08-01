import { create } from './create.js';
import { Subject } from './subject.js';
import { subscribeToSource } from './util/observable-helpers.js';

export const windowWhen: unique symbol = Symbol('windowWhen');

declare global {
  interface Observable<T> {
    [windowWhen](closingSelector: () => ObservableValue<unknown>): Observable<Observable<T>>;
  }
}

Observable.prototype[windowWhen] = function <T>(
  this: Observable<T>,
  closingSelector: () => ObservableValue<unknown>
): Observable<Observable<T>> {
  return this[create]((subscriber) => {
    let currentWindow: Subject<T> | null = null;
    let closingController: AbortController | null = null;
    let sourceController: AbortController | null = null;
    let rotationPending = false;
    let drainingRotations = false;
    let terminated = false;

    const releaseInputs = () => {
      closingController?.abort(subscriber.signal.reason);
      sourceController?.abort(subscriber.signal.reason);
      closingController = null;
      currentWindow = null;
      rotationPending = false;
    };

    const terminateWithError = (error: unknown) => {
      if (terminated || !subscriber.active) {
        return;
      }

      terminated = true;
      rotationPending = false;
      const activeWindow = currentWindow;
      currentWindow = null;
      activeWindow?.error(error);
      subscriber.error(error);
    };

    const requestRotation = () => {
      if (terminated || !subscriber.active) {
        return;
      }

      rotationPending = true;
      if (drainingRotations) {
        return;
      }

      drainingRotations = true;
      try {
        while (rotationPending && !terminated && subscriber.active) {
          rotationPending = false;

          // RxJS 7 cancels the prior closing before completing its window.
          const previousClosing = closingController;
          closingController = null;
          previousClosing?.abort();

          const previousWindow = currentWindow;
          currentWindow = null;
          previousWindow?.complete();

          if (terminated || !subscriber.active) {
            break;
          }

          const nextWindow = new Subject<T>();
          currentWindow = nextWindow;
          subscriber.next(nextWindow.asObservable());

          if (terminated || !subscriber.active) {
            break;
          }

          let closingValue: ObservableValue<unknown>;
          try {
            // Pinned RxJS 7 ordering: the window is observable before its
            // selector is invoked.
            closingValue = closingSelector();
          } catch (error) {
            terminateWithError(error);
            break;
          }

          let closingSource: Observable<unknown>;
          try {
            closingSource = Observable.from(closingValue);
          } catch (error) {
            terminateWithError(error);
            break;
          }

          if (terminated || !subscriber.active) {
            break;
          }

          const controller = new AbortController();
          closingController = controller;
          let signaled = false;

          const closeAndRotate = () => {
            if (signaled || terminated || !subscriber.active) {
              return;
            }

            signaled = true;
            if (closingController === controller) {
              closingController = null;
            }
            controller.abort();
            requestRotation();
          };

          subscribeToSource(
            closingSource,
            subscriber,
            {
              next: closeAndRotate,
              error: terminateWithError,
              complete: closeAndRotate,
            },
            controller.signal
          );
        }
      } finally {
        drainingRotations = false;
      }
    };

    // Cancellation is not completion. Release the live read-only window
    // without a terminal notification and cancel source and closing work.
    subscriber.addTeardown(releaseInputs);

    // The first window and its closing input exist before source activation.
    requestRotation();

    sourceController = new AbortController();
    if (subscriber.active) {
      subscriber.addTeardown(() => sourceController?.abort(subscriber.signal.reason));
    }

    try {
      this.subscribe(
        {
          next: (value) => currentWindow?.next(value),
          error: terminateWithError,
          complete: () => {
            if (terminated || !subscriber.active) {
              return;
            }

            terminated = true;
            rotationPending = false;
            const activeWindow = currentWindow;
            currentWindow = null;
            activeWindow?.complete();
            subscriber.complete();
          },
        },
        { signal: sourceController.signal }
      );
    } catch (error) {
      terminateWithError(error);
    }

    // RxJS 7 still reaches source subscription after a synchronous closing
    // failure. Activate it, then immediately cancel it with the closed result.
    if (!subscriber.active) {
      sourceController.abort(subscriber.signal.reason);
    }
  });
};
