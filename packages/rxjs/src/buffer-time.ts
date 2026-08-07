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

// BEGIN GENERATED FUNCTIONAL SURFACE

/**
 * Creates the pipeable `bufferTime` form of the exact-Symbol `[bufferTime]` capability.
 *
 * The source is supplied when the returned unary function is composed with
 * `rx`, `pipe`, or another function-composition helper. The result uses the same construction, error-forwarding, and AbortSignal cancellation behavior as the Symbol form.
 *
 * @returns A unary function that applies `[bufferTime]` to its source.
 */
export function pipeableBufferTime<T>(span: number, creationInterval?: number | null, maxBufferSize?: number): (source: Observable<T>) => Observable<T[]>;
export function pipeableBufferTime(...args: any[]): any {
  return (source: Observable<any>) => Reflect.apply(source[bufferTime] as (...values: any[]) => any, source, args);
}

// END GENERATED FUNCTIONAL SURFACE
