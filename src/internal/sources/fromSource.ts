import { ObservableInput, Source } from 'rxjs/internal/types';
import { ofSource } from 'rxjs/internal/create/of';
import { isArrayLike } from 'rxjs/internal/util/isArrayLike';
import { isPromiseLike } from 'rxjs/internal/util/isPromiseLike';
import { isIterable } from 'rxjs/internal/util/isIterable';
import { isInteropObservable } from 'rxjs/internal/util/isInteropObservable';
import { isAsyncIterable } from 'rxjs/internal/util/isAsyncIterable';
import { isObservable } from 'rxjs/internal/util/isObservable';
import { asyncIterableSource } from 'rxjs/internal/sources/asyncIterableSource';
import { symbolObservableSource } from 'rxjs/internal/sources/symbolObservableSource';
import { iterableSource } from 'rxjs/internal/sources/iterableSource';
import { promiseSource } from 'rxjs/internal/sources/promiseSource';
export function fromSource<T>(input: ObservableInput<T>): Source<T> {
  if (isObservable(input)) {
    return input;
  } else if (isPromiseLike(input)) {
    return promiseSource(input);
  } else if (isArrayLike(input)) {
    return ofSource(input);
  } else if (isIterable(input)) {
    return iterableSource(input);
  } else if (isInteropObservable(input)) {
    return symbolObservableSource(input);
  } else if (isAsyncIterable(input)) {
    return asyncIterableSource(input);
  }
  throw new Error('Unable to convert from input to Observable source');
}
