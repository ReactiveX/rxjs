import { create } from './create.js';
import { subscribeToSource } from './util/observable-helpers.js';

export const bufferTime: unique symbol = Symbol('bufferTime');

declare global {
  interface Observable<T> {
    [bufferTime]: (span: number, creationInterval?: number | null, maxBufferSize?: number) => Observable<T[]>;
  }
}

interface BufferContext<T> {
  readonly values: T[];
  timer: ReturnType<typeof globalThis.setTimeout>;
}

Observable.prototype[bufferTime] = function <T>(
  this: Observable<T>,
  span: number,
  creationInterval: number | null = null,
  maxBufferSize = Infinity
): Observable<T[]> {
  return this[create]((subscriber) => {
    const contexts: BufferContext<T>[] = [];
    let creationTimer: ReturnType<typeof globalThis.setInterval> | undefined;

    const removeContext = (context: BufferContext<T>): boolean => {
      const index = contexts.indexOf(context);
      if (index < 0) {
        return false;
      }
      contexts.splice(index, 1);
      globalThis.clearTimeout(context.timer);
      return true;
    };

    const openContext = (): BufferContext<T> => {
      const context: BufferContext<T> = {
        values: [],
        timer: undefined!,
      };
      contexts.push(context);
      context.timer = globalThis.setTimeout(() => closeContext(context), Math.max(0, span));
      return context;
    };

    const closeContext = (context: BufferContext<T>): void => {
      if (!removeContext(context) || !subscriber.active) {
        return;
      }
      const values = context.values.slice();
      if (creationInterval === null) {
        openContext();
      }
      subscriber.next(values);
    };

    subscriber.addTeardown(() => {
      if (creationTimer !== undefined) {
        globalThis.clearInterval(creationTimer);
      }
      for (const context of contexts) {
        globalThis.clearTimeout(context.timer);
      }
      contexts.length = 0;
    });

    try {
      openContext();
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
          context.values.push(value);
          if (context.values.length >= maxBufferSize) {
            closeContext(context);
          }
        }
      },
      complete: () => {
        if (creationTimer !== undefined) {
          globalThis.clearInterval(creationTimer);
          creationTimer = undefined;
        }
        const remaining = contexts.slice();
        contexts.length = 0;
        for (const context of remaining) {
          globalThis.clearTimeout(context.timer);
          if (subscriber.active) {
            subscriber.next(context.values.slice());
          }
        }
        subscriber.complete();
      },
    });
  });
};
