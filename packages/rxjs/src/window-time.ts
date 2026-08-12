import { create } from './create.js';
import { Subject } from './subject.js';
import { subscribeToSource } from './util/observable-helpers.js';

export const windowTime: unique symbol = Symbol('windowTime');

declare global {
  interface Observable<T> {
    [windowTime]: (span: number, creationInterval?: number | null, maxWindowSize?: number) => Observable<Observable<T>>;
  }
}

interface WindowContext<T> {
  readonly subject: Subject<T>;
  count: number;
  timer: ReturnType<typeof globalThis.setTimeout>;
}

Observable.prototype[windowTime] = function <T>(
  this: Observable<T>,
  span: number,
  creationInterval: number | null = null,
  maxWindowSize = Infinity
): Observable<Observable<T>> {
  return this[create]((subscriber) => {
    const contexts: WindowContext<T>[] = [];
    let creationTimer: ReturnType<typeof globalThis.setInterval> | undefined;

    const stopCreation = (): void => {
      if (creationTimer !== undefined) {
        globalThis.clearInterval(creationTimer);
        creationTimer = undefined;
      }
    };

    const removeContext = (context: WindowContext<T>): boolean => {
      const index = contexts.indexOf(context);
      if (index < 0) {
        return false;
      }
      contexts.splice(index, 1);
      globalThis.clearTimeout(context.timer);
      return true;
    };

    const openContext = (): WindowContext<T> => {
      const context: WindowContext<T> = {
        subject: new Subject<T>(),
        count: 0,
        timer: undefined!,
      };
      contexts.push(context);
      context.timer = globalThis.setTimeout(() => closeContext(context), Math.max(0, span));
      subscriber.next(context.subject.asObservable());
      return context;
    };

    const closeContext = (context: WindowContext<T>): void => {
      if (!removeContext(context)) {
        return;
      }
      if (creationInterval === null && subscriber.active) {
        openContext();
      }
      context.subject.complete();
    };

    subscriber.addTeardown(() => {
      stopCreation();
      for (const context of contexts) {
        globalThis.clearTimeout(context.timer);
      }
      contexts.length = 0;
    });

    try {
      openContext();
      if (!subscriber.active) {
        return;
      }
      if (creationInterval !== null) {
        creationTimer = globalThis.setInterval(() => {
          if (subscriber.active) {
            openContext();
          }
        }, Math.max(0, creationInterval));
      }
    } catch (error) {
      subscriber.error(error);
      return;
    }

    subscribeToSource(this, subscriber, {
      next: (value) => {
        for (const context of contexts.slice()) {
          context.subject.next(value);
          context.count++;
          if (context.count >= maxWindowSize) {
            closeContext(context);
          }
          if (!subscriber.active) {
            return;
          }
        }
      },
      error: (error) => {
        stopCreation();
        const active = contexts.slice();
        contexts.length = 0;
        for (const context of active) {
          globalThis.clearTimeout(context.timer);
          context.subject.error(error);
        }
        subscriber.error(error);
      },
      complete: () => {
        stopCreation();
        const active = contexts.slice();
        contexts.length = 0;
        for (const context of active) {
          globalThis.clearTimeout(context.timer);
          context.subject.complete();
        }
        subscriber.complete();
      },
    });
  });
};
