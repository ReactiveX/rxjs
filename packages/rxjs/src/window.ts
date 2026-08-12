import { create } from './create.js';
import { Subject } from './subject.js';
import { subscribeToSource } from './util/observable-helpers.js';

export const window: unique symbol = Symbol('window');

declare global {
  interface Observable<T> {
    [window](boundaries: ObservableValue<any>): Observable<Observable<T>>;
  }
}

Observable.prototype[window] = function <T>(this: Observable<T>, boundaries: ObservableValue<any>): Observable<Observable<T>> {
  return this[create]((subscriber) => {
    let currentWindow: Subject<T> | null = null;

    const releaseWindow = () => {
      currentWindow = null;
    };

    const openWindow = () => {
      const nextWindow = new Subject<T>();
      currentWindow = nextWindow;
      subscriber.next(nextWindow.asObservable());
    };

    const closeWindow = () => {
      const activeWindow = currentWindow;
      currentWindow = null;
      activeWindow?.complete();
    };

    const errorWindowAndOuter = (error: unknown) => {
      const activeWindow = currentWindow;
      currentWindow = null;
      activeWindow?.error(error);
      subscriber.error(error);
    };

    const rotateWindow = () => {
      closeWindow();
      if (subscriber.active) {
        openWindow();
      }
    };

    // Cancellation is not completion. The current window remains
    // nonterminal, while the result signal cancels source and boundary work.
    subscriber.addTeardown(releaseWindow);

    // RxJS 7 exposes the initial window before activating either input.
    openWindow();
    if (!subscriber.active) {
      return;
    }

    // RxJS 7 activates the source before the boundary input. This ordering is
    // observable for synchronous inputs.
    subscribeToSource(this, subscriber, {
      next: (value) => currentWindow?.next(value),
      error: errorWindowAndOuter,
      complete: () => {
        closeWindow();
        subscriber.complete();
      },
    });

    let boundarySource: Observable<any>;
    try {
      boundarySource = Observable.from(boundaries);
    } catch (error) {
      if (subscriber.active) {
        errorWindowAndOuter(error);
      }
      return;
    }

    const boundaryController = new AbortController();
    if (subscriber.active) {
      subscriber.addTeardown(() => boundaryController.abort(subscriber.signal.reason));
    }

    boundarySource.subscribe(
      {
        next: rotateWindow,
        error: errorWindowAndOuter,
      },
      { signal: boundaryController.signal }
    );

    // A synchronous source may have already terminated the result. RxJS 7
    // still activates the boundary input after that source, then immediately
    // cancels it as part of the closed outer subscription.
    if (!subscriber.active) {
      boundaryController.abort(subscriber.signal.reason);
    }
  });
};
