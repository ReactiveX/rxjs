import type { ReadableStreamLike, InteropObservable, CompleteNotification, ErrorNotification, NextNotification } from './types.js';

export function isAsyncIterable<T>(obj: any): obj is AsyncIterable<T> {
  return Symbol.asyncIterator && isFunction(obj?.[Symbol.asyncIterator]);
}

/**
 * Returns true if the object is a function.
 * @param value The value to check
 */
export function isFunction(value: any): value is (...args: any[]) => any {
  return typeof value === 'function';
}

export function isReadableStreamLike<T>(obj: any): obj is ReadableStreamLike<T> {
  // We don't want to use instanceof checks because they would return
  // false for instances from another Realm, like an <iframe>.
  return isFunction(obj?.getReader);
}

/**
 * Tests to see if the object is "thennable".
 * @param value the object to test
 */
export function isPromise(value: any): value is PromiseLike<any> {
  return isFunction(value?.then);
}
/** Identifies an input as being Observable (but not necessary an Rx Observable) */
export function isInteropObservable(input: any): input is InteropObservable<any> {
  return isFunction(input[Symbol.observable ?? '@@observable']);
}

/** Identifies an input as being an Iterable */
export function isIterable(input: any): input is Iterable<any> {
  return isFunction(input?.[Symbol.iterator]);
}

export function isArrayLike<T>(x: any): x is ArrayLike<T> {
  return x && typeof x.length === 'number' && !isFunction(x);
}

/**
 * A completion object optimized for memory use and created to be the
 * same "shape" as other notifications in v8.
 * @internal
 */
export const COMPLETE_NOTIFICATION = (() => createNotification('C', undefined, undefined) as CompleteNotification)();

/**
 * Internal use only. Creates an optimized error notification that is the same "shape"
 * as other notifications.
 * @internal
 */
export function errorNotification(error: any): ErrorNotification {
  return createNotification('E', undefined, error) as any;
}

/**
 * Internal use only. Creates an optimized next notification that is the same "shape"
 * as other notifications.
 * @internal
 */
export function nextNotification<T>(value: T) {
  return createNotification('N', value, undefined) as NextNotification<T>;
}

export function createNotification<T>(kind: 'N', value: T, error: undefined): { kind: 'N'; value: T; error: undefined };
export function createNotification<T>(kind: 'E', value: undefined, error: any): { kind: 'E'; value: undefined; error: any };
export function createNotification<T>(kind: 'C', value: undefined, error: undefined): { kind: 'C'; value: undefined; error: undefined };
export function createNotification<T>(
  kind: 'N' | 'E' | 'C',
  value: T | undefined,
  error: any
): { kind: 'N' | 'E' | 'C'; value: T | undefined; error: any };

/**
 * Ensures that all notifications created internally have the same "shape" in v8.
 *
 * TODO: This is only exported to support a crazy legacy test in `groupBy`.
 * @internal
 */
export function createNotification<T>(kind: 'N' | 'E' | 'C', value: T | undefined, error: any) {
  return {
    kind,
    value,
    error,
  };
}

export async function* readableStreamLikeToAsyncGenerator<T>(readableStream: ReadableStreamLike<T>): AsyncGenerator<T> {
  const reader = readableStream.getReader();
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        return;
      }
      yield value!;
    }
  } finally {
    reader.releaseLock();
  }
}
