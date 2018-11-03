import { Observable } from 'rxjs/internal/Observable';
import { filter } from 'rxjs/internal/operators/filter';
import { OperatorFunction, Sink, FOType, SinkArg } from 'rxjs/internal/types';
import { take } from 'rxjs/internal/operators/take';
import { throwIfEmpty } from 'rxjs/internal/operators/derived/throwIfEmpty';
import { lift } from 'rxjs/internal/util/lift';
import { Subscription } from 'rxjs/internal/Subscription';
import { tryUserFunction, resultIsError } from 'rxjs/internal/util/userFunction';
import { EmptyError } from 'rxjs/internal/util/EmptyError';

/**
 * Returns an Observable that emits the single item emitted by the source Observable that matches a specified
 * predicate, if that Observable emits one such item. If the source Observable emits more than one such item or no
 * items, notify of an IllegalArgumentException or NoSuchElementException respectively. If the source Observable
 * emits items but none match the specified predicate then `undefined` is emiited.
 *
 * ![](single.png)
 *
 * @throws {EmptyError} Delivers an EmptyError to the Observer's `error`
 * callback if the Observable completes before any `next` notification was sent.
 * @param {Function} predicate - A predicate function to evaluate items emitted by the source Observable.
 * @return {Observable<T>} An Observable that emits the single item emitted by the source Observable that matches
 * the predicate or `undefined` when no items match.
 *
 * @method single
 * @owner Observable
 */
export function single<T>(predicate?: (value: T, index: number, source: Observable<T>) => boolean): OperatorFunction<T, T> {
  return lift((source: Observable<T>, dest: Sink<T>, subs: Subscription) => {
    let _hasValue = false;
    let _i = 0;
    let _value: T;
    const applySingleValue = (value: T) => {
      if (_hasValue) {
        dest(FOType.ERROR, new Error('Sequence contains more than one element'), subs);
      } else {
        _hasValue = true;
        _value = value;
      }
    };

    source(FOType.SUBSCRIBE, (t: FOType, v: SinkArg<T>, subs: Subscription) => {
      switch (t) {
        case FOType.NEXT:
          const index = _i++;
          if (predicate) {
            const result = tryUserFunction(predicate, v, index, source);
            if (resultIsError(result)) {
              dest(FOType.ERROR, result.error, subs);
            } else if (result) {
              applySingleValue(v);
            }
          } else {
            applySingleValue(v);
          }
          break;
        case FOType.COMPLETE:
          if (_i > 0) {
            dest(FOType.NEXT, _hasValue ? _value : undefined, subs);
            dest(FOType.COMPLETE, undefined, subs);
          } else {
            dest(FOType.ERROR, new EmptyError(), subs);
          }
          break;
        default:
          dest(t, v, subs);
      }
    }, subs);
  });
}
