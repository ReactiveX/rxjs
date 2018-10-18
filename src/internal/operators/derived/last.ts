import { Operation } from 'rxjs/internal/types';
import { Observable } from 'rxjs/internal/Observable';
import { identity } from 'rxjs/internal/util/identity';
import { throwIfEmpty } from 'rxjs/internal/operators/derived/throwIfEmpty';
import { defaultIfEmpty } from 'rxjs/internal/operators/defaultIfEmpty';
import { takeLast } from 'rxjs/internal/operators/takeLast';
import { filter } from 'rxjs/internal/operators/filter';
import { EmptyError } from 'rxjs/internal/util/EmptyError';

/* tslint:disable:max-line-length */
export function last<T, D = T>(
  predicate?: null,
  defaultValue?: D
): Operation<T, T | D>;
export function last<T, S extends T>(
  predicate: (value: T, index: number, source: Observable<T>) => value is S,
  defaultValue?: S
): Operation<T, S>;
export function last<T, D = T>(
  predicate: (value: T, index: number, source: Observable<T>) => boolean,
  defaultValue?: D
): Operation<T, T | D>;
/* tslint:enable:max-line-length */

/**
 * Returns an Observable that emits only the last item emitted by the source Observable.
 * It optionally takes a predicate function as a parameter, in which case, rather than emitting
 * the last item from the source Observable, the resulting Observable will emit the last item
 * from the source Observable that satisfies the predicate.
 *
 * ![](last.png)
 *
 * @throws {EmptyError} Delivers an EmptyError to the Observer's `error`
 * callback if the Observable completes before any `next` notification was sent.
 * @param {function} [predicate] - The condition any source emitted item has to satisfy.
 * @param {any} [defaultValue] - An optional default value to provide if last
 * predicate isn't met or no values were emitted.
 * @return {Observable} An Observable that emits only the last item satisfying the given condition
 * from the source, or an NoSuchElementException if no such items are emitted.
 * @throws - Throws if no items that match the predicate are emitted by the source Observable.
 */
export function last<T, D>(
  predicate?: ((value: T, index: number, source: Observable<T>) => boolean) | null,
  defaultValue?: D
): Operation<T, T | D> {
  const hasDefaultValue = arguments.length >= 2;
  return (source: Observable<T>) => source.pipe(
    predicate ? filter((v, i) => predicate(v, i, source)) : identity,
    takeLast(1),
    hasDefaultValue ? defaultIfEmpty<T | D>(defaultValue) : throwIfEmpty(() => new EmptyError()),
  );
}
