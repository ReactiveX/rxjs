/** @prettier */
import { MonoTypeOperatorFunction } from '../types';
import { operate } from '../util/lift';
import { OperatorSubscriber } from './OperatorSubscriber';

/* tslint:disable:max-line-length */
export function distinctUntilChanged<T>(compare?: (x: T, y: T) => boolean): MonoTypeOperatorFunction<T>;
export function distinctUntilChanged<T, K>(compare: (x: K, y: K) => boolean, keySelector: (x: T) => K): MonoTypeOperatorFunction<T>;
/* tslint:enable:max-line-length */

/**
 * Returns an Observable that emits all items emitted by the source Observable that are distinct by comparison from the previous item.
 *
 * If a comparator function is provided, then it will be called for each item to test for whether or not that value should be emitted.
 * The comparator function shourld return true if the values are the same, and false if they are different.
 *
 * If a comparator function is not provided, an equality check is used by default.
 *
 * ## Example
 * A simple example with numbers
 * ```ts
 * import { of } from 'rxjs';
 * import { distinctUntilChanged } from 'rxjs/operators';
 *
 * of(1, 1, 2, 2, 2, 1, 1, 2, 3, 3, 4).pipe(
 *     distinctUntilChanged(),
 *   )
 *   .subscribe(x => console.log(x)); // 1, 2, 1, 2, 3, 4
 * ```
 *
 * An example using a compare function
 * ```typescript
 * import { of } from 'rxjs';
 * import { distinctUntilChanged } from 'rxjs/operators';
 *
 * interface Person {
 *    age: number,
 *    name: string
 * }
 *
 *of(
 *     { age: 4, name: 'Foo'},
 *     { age: 7, name: 'Bar'},
 *     { age: 5, name: 'Foo'},
 *     { age: 6, name: 'Foo'},
 *   ).pipe(
 *     distinctUntilChanged((p: Person, q: Person) => p.name === q.name),
 *   )
 *   .subscribe(x => console.log(x));
 *
 * // displays:
 * // { age: 4, name: 'Foo' }
 * // { age: 7, name: 'Bar' }
 * // { age: 5, name: 'Foo' }
 * ```
 *
 * @see {@link distinct}
 * @see {@link distinctUntilKeyChanged}
 *
 * @param {function} [compare] Optional comparison function called to test if an item is distinct from the previous item in the source.
 * A return value of true indicates that it is the same, and a return value of false means they are different.
 * @return {Observable} An Observable that emits items from the source Observable with distinct values.
 */
export function distinctUntilChanged<T, K>(compare?: (a: K, b: K) => boolean, keySelector?: (x: T) => K): MonoTypeOperatorFunction<T> {
  compare = compare ?? defaultCompare;
  return operate((source, subscriber) => {
    let prev: any;
    let first = true;
    source.subscribe(
      new OperatorSubscriber(subscriber, (value) => {
        // WARNING: Intentionally terse code for library size.
        // If this is the first value, set the previous value state, the `1` is to allow it to move to the next
        // part of the terse conditional. Then we capture `prev` to pass to `compare`, but set `prev` to the result of
        // either the `keySelector` -- if provided -- or the `value`, *then* it will execute the `compare`.
        // If `compare` returns truthy, it will move on to call `subscriber.next()`.
        ((first && ((prev = value), 1)) || !compare!(prev, (prev = keySelector ? keySelector(value) : (value as any)))) &&
          subscriber.next(value);
        first = false;
      })
    );
  });
}

function defaultCompare(a: any, b: any) {
  return a === b;
}
