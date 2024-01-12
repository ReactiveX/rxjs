import { isInteropObservable, isArrayLike, isPromise, isAsyncIterable, isIterable, isReadableStreamLike } from './utils.js';
import { Observable } from './Observable.js';

export enum ObservableInputType {
  Own,
  InteropObservable,
  ArrayLike,
  Promise,
  AsyncIterable,
  Iterable,
  ReadableStreamLike,
}

/**
 * Examines a value and returns an enum indicating what type of ObservableInput it is.
 * This exists because both {@link from} and {@link scheduled} need to perform this same
 * logical check in the same order.
 * @param input a value we want to check to see if it can be converted to an observable
 * @returns An enum value indicating the type of conversion that can be done.
 */
export function getObservableInputType(input: unknown): ObservableInputType {
  if (input instanceof Observable) {
    return ObservableInputType.Own;
  }
  if (isInteropObservable(input)) {
    return ObservableInputType.InteropObservable;
  }
  if (isArrayLike(input)) {
    return ObservableInputType.ArrayLike;
  }
  if (isPromise(input)) {
    return ObservableInputType.Promise;
  }
  if (isAsyncIterable(input)) {
    return ObservableInputType.AsyncIterable;
  }
  if (isIterable(input)) {
    return ObservableInputType.Iterable;
  }
  if (isReadableStreamLike(input)) {
    return ObservableInputType.ReadableStreamLike;
  }
  throw new TypeError(
    `You provided ${
      input !== null && typeof input === 'object' ? 'an invalid object' : `'${input}'`
    } where a stream was expected. You can provide an Observable, Promise, ReadableStream, Array, AsyncIterable, or Iterable.`
  );
}
