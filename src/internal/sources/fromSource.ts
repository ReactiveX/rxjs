import { ObservableInput, Source } from '../types';
import { ofSource } from '../create/of';
import { isArrayLike } from '../util/isArrayLike';
import { isPromiseLike } from '../util/isPromiseLike';
import { isIterable } from '../util/isIterable';
import { isInteropObservable } from '../util/isInteropObservable';
import { isAsyncIterable } from '../util/isAsyncIterable';
import { isObservable } from '../util/isObservable';
import { asyncIterableSource } from "../sources/asyncIterableSource";
import { symbolObservableSource } from "../sources/symbolObservableSource";
import { iterableSource } from "../sources/iterableSource";
import { promiseSource } from "../sources/promiseSource";
export function fromSource<T>(input: ObservableInput<T>): Source<T> {
  if (isObservable(input)) {
    return input;
  }
  else if (isPromiseLike(input)) {
    return promiseSource(input);
  }
  else if (isArrayLike(input)) {
    return ofSource(input);
  }
  else if (isIterable(input)) {
    return iterableSource(input);
  }
  else if (isInteropObservable(input)) {
    return symbolObservableSource(input);
  }
  else if (isAsyncIterable(input)) {
    return asyncIterableSource(input);
  }
  throw new Error('Unable to convert from input to Observable source');
}
