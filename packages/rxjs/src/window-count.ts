import { create } from './create.js';
import { Subject } from './subject.js';
import { subscribeToSource } from './util/observable-helpers.js';

export const windowCount: unique symbol = Symbol('windowCount');

declare global {
  interface Observable<T> {
    [windowCount](windowSize: number, startWindowEvery?: number): Observable<Observable<T>>;
  }
}

Observable.prototype[windowCount] = function <T>(this: Observable<T>, windowSize: number, startWindowEvery = 0): Observable<Observable<T>> {
  const startEvery = startWindowEvery > 0 ? startWindowEvery : windowSize;

  return this[create]((subscriber) => {
    let windows: Subject<T>[] = [];
    let count = 0;

    const closeWindows = () => {
      const activeWindows = windows;
      windows = [];
      for (const window of activeWindows) {
        window.complete();
      }
    };

    const releaseWindows = () => {
      windows = [];
    };

    const errorWindows = (error: unknown) => {
      const activeWindows = windows;
      windows = [];
      for (const window of activeWindows) {
        window.error(error);
      }
    };

    const openWindow = () => {
      const window = new Subject<T>();
      windows.push(window);
      subscriber.next(window.asObservable());
    };

    // Cancellation is not completion. Release the operator's references to
    // live windows without sending them a terminal notification.
    subscriber.addTeardown(releaseWindows);

    // RxJS 7 makes the initial window observable before source activation.
    openWindow();
    if (!subscriber.active) {
      return;
    }

    subscribeToSource(this, subscriber, {
      next: (value) => {
        for (const window of windows) {
          window.next(value);
          if (!subscriber.active) {
            return;
          }
        }

        const closeCount = count - windowSize + 1;
        if (closeCount >= 0 && closeCount % startEvery === 0) {
          windows.shift()?.complete();
        }

        count++;
        if (count % startEvery === 0 && subscriber.active) {
          // Opening after the preceding value makes the window available
          // before its first boundary value is routed.
          openWindow();
        }
      },
      error: (error) => {
        errorWindows(error);
        subscriber.error(error);
      },
      complete: () => {
        closeWindows();
        subscriber.complete();
      },
    });
  });
};

// BEGIN GENERATED FUNCTIONAL SURFACE

/**
 * Creates the pipeable `windowCount` form of the exact-Symbol `[windowCount]` capability.
 *
 * The source is supplied when the returned unary function is composed with
 * `rx`, `pipe`, or another function-composition helper. The result uses the same construction, error-forwarding, and AbortSignal cancellation behavior as the Symbol form.
 *
 * @returns A unary function that applies `[windowCount]` to its source.
 */
export function pipeableWindowCount<T>(windowSize: number, startWindowEvery?: number): (source: Observable<T>) => Observable<Observable<T>>;
export function pipeableWindowCount(...args: any[]): any {
  return (source: Observable<any>) => Reflect.apply(source[windowCount] as (...values: any[]) => any, source, args);
}

// END GENERATED FUNCTIONAL SURFACE
