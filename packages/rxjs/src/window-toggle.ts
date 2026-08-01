import { create } from './create.js';
import { Subject } from './subject.js';
import { subscribeToSource } from './util/observable-helpers.js';

export const windowToggle: unique symbol = Symbol('windowToggle');

declare global {
  interface Observable<T> {
    [windowToggle]<Opening>(
      openings: ObservableValue<Opening>,
      closingSelector: (opening: Opening) => ObservableValue<unknown>
    ): Observable<Observable<T>>;
  }
}

interface WindowContext<T> {
  readonly subject: Subject<T>;
  readonly view: Observable<T>;
  readonly closingController: AbortController;
}

Observable.prototype[windowToggle] = function <T, Opening>(
  this: Observable<T>,
  openings: ObservableValue<Opening>,
  closingSelector: (opening: Opening) => ObservableValue<unknown>
): Observable<Observable<T>> {
  return this[create]((subscriber) => {
    let windows: WindowContext<T>[] = [];
    let sourceController: AbortController | null = null;
    let terminated = false;
    const openingsController = new AbortController();
    const closingControllers = new Set<AbortController>();

    const releaseInputs = () => {
      openingsController.abort(subscriber.signal.reason);
      sourceController?.abort(subscriber.signal.reason);
      for (const controller of closingControllers) {
        controller.abort(subscriber.signal.reason);
      }
      closingControllers.clear();
      windows = [];
    };

    const terminateWindows = (kind: 'complete' | 'error', error?: unknown) => {
      const activeWindows = windows;
      windows = [];
      for (const context of activeWindows) {
        if (kind === 'complete') {
          context.subject.complete();
        } else {
          context.subject.error(error);
        }
      }
    };

    const terminateWithError = (error: unknown) => {
      if (terminated || !subscriber.active) {
        return;
      }

      terminated = true;
      terminateWindows('error', error);
      subscriber.error(error);
    };

    const closeWindow = (context: WindowContext<T>) => {
      const index = windows.indexOf(context);
      if (index < 0) {
        return;
      }

      windows.splice(index, 1);
      closingControllers.delete(context.closingController);
      // RxJS 7 completes the window before unsubscribing its closing input.
      context.subject.complete();
      context.closingController.abort();
    };

    const openWindow = (opening: Opening) => {
      if (terminated || !subscriber.active) {
        return;
      }

      const subject = new Subject<T>();
      const context: WindowContext<T> = {
        subject,
        view: subject.asObservable(),
        closingController: new AbortController(),
      };
      windows.push(context);
      closingControllers.add(context.closingController);

      let closingValue: ObservableValue<unknown>;
      try {
        closingValue = closingSelector(opening);
      } catch (error) {
        terminateWithError(error);
        return;
      }

      let closingSource: Observable<unknown>;
      try {
        closingSource = Observable.from(closingValue);
      } catch (error) {
        terminateWithError(error);
        return;
      }

      // RxJS 7 exposes the window before activating its closing input. This
      // lets a synchronous closing value complete an already-observable
      // window rather than hiding the window entirely.
      subscriber.next(context.view);

      if (!subscriber.active || !windows.includes(context)) {
        return;
      }

      subscribeToSource(
        closingSource,
        subscriber,
        {
          next: () => closeWindow(context),
          error: terminateWithError,
          // Pinned RxJS 7 behavior: completion without a value does not
          // close the window. The source terminal event still closes it.
          complete: () => closingControllers.delete(context.closingController),
        },
        context.closingController.signal
      );
    };

    // Cancellation is not completion. Release live read-only windows without
    // a terminal notification and cancel all source, opening, and closing work.
    subscriber.addTeardown(releaseInputs);

    let openingsSource: Observable<Opening>;
    try {
      openingsSource = Observable.from(openings);
    } catch (error) {
      terminateWithError(error);
      return;
    }

    // RxJS 7 activates openings before the source so synchronous openings can
    // establish (and even close) windows before source work begins.
    subscribeToSource(
      openingsSource,
      subscriber,
      {
        next: openWindow,
        error: terminateWithError,
        complete: () => void 0,
      },
      openingsController.signal
    );

    sourceController = new AbortController();
    if (subscriber.active) {
      subscriber.addTeardown(() => sourceController?.abort(subscriber.signal.reason));
    }

    try {
      this.subscribe(
        {
          next: (value) => {
            // Snapshot the active set so reentrant openings do not receive the
            // value that caused them and reentrant closings remain isolated.
            for (const context of windows.slice()) {
              context.subject.next(value);
              if (!subscriber.active) {
                return;
              }
            }
          },
          error: terminateWithError,
          complete: () => {
            if (terminated || !subscriber.active) {
              return;
            }

            terminated = true;
            terminateWindows('complete');
            subscriber.complete();
          },
        },
        { signal: sourceController.signal }
      );
    } catch (error) {
      terminateWithError(error);
    }

    // A synchronous openings error still precedes source activation in RxJS
    // 7. Activate it and immediately cancel it with the closed result.
    if (!subscriber.active) {
      sourceController.abort(subscriber.signal.reason);
    }
  });
};
