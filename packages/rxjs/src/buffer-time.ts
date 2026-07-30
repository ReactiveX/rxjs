import { create } from './create.js';

export const bufferTime: unique symbol = Symbol('bufferTime');

declare global {
  interface Observable<T> {
    [bufferTime]: (span: number, creationInterval?: number | null, maxBufferSize?: number) => Observable<T[]>;
  }
}

interface BufferContext<T> {
  readonly values: T[];
  timer: ReturnType<typeof setTimeout>;
}

Observable.prototype[bufferTime] = function <T>(
  this: Observable<T>,
  span: number,
  creationInterval: number | null = null,
  maxBufferSize = Infinity
): Observable<T[]> {
  return this[create]((subscriber) => {
    const contexts: BufferContext<T>[] = [];
    let creationTimer: ReturnType<typeof setInterval> | undefined;

    const removeContext = (context: BufferContext<T>): boolean => {
      const index = contexts.indexOf(context);
      if (index < 0) {
        return false;
      }
      contexts.splice(index, 1);
      clearTimeout(context.timer);
      return true;
    };

    const openContext = (): BufferContext<T> => {
      const context: BufferContext<T> = {
        values: [],
        timer: undefined!,
      };
      contexts.push(context);
      context.timer = setTimeout(() => closeContext(context), Math.max(0, span));
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
        clearInterval(creationTimer);
      }
      for (const context of contexts) {
        clearTimeout(context.timer);
      }
      contexts.length = 0;
    });

    try {
      openContext();
      if (creationInterval !== null) {
        creationTimer = setInterval(() => {
          if (subscriber.active) {
            openContext();
          }
        }, Math.max(0, creationInterval));
      }
    } catch (error) {
      subscriber.error(error);
      return;
    }

    this.subscribe(
      {
        next: (value) => {
          for (const context of contexts.slice()) {
            context.values.push(value);
            if (context.values.length >= maxBufferSize) {
              closeContext(context);
            }
          }
        },
        error: (error) => subscriber.error(error),
        complete: () => {
          if (creationTimer !== undefined) {
            clearInterval(creationTimer);
            creationTimer = undefined;
          }
          const remaining = contexts.slice();
          contexts.length = 0;
          for (const context of remaining) {
            clearTimeout(context.timer);
            if (subscriber.active) {
              subscriber.next(context.values.slice());
            }
          }
          subscriber.complete();
        },
      },
      { signal: subscriber.signal }
    );
  });
};
