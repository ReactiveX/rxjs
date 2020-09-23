/** @prettier */
import { OperatorFunction, MonoTypeOperatorFunction } from '../types';
import { operate } from '../util/lift';
import { OperatorSubscriber } from './OperatorSubscriber';

/* tslint:disable:max-line-length */
export function filter<T, S extends T>(predicate: (value: T, index: number) => value is S, thisArg?: any): OperatorFunction<T, S>;
// NOTE(benlesh): T|null|undefined solves the issue discussed here: https://github.com/ReactiveX/rxjs/issues/4959#issuecomment-520629091
export function filter<T>(predicate: BooleanConstructor): OperatorFunction<T | null | undefined, NonNullable<T>>;
export function filter<T>(predicate: (value: T, index: number) => boolean, thisArg?: any): MonoTypeOperatorFunction<T>;
/* tslint:enable:max-line-length */

/**
 * Filter items emitted by the source Observable by only emitting those that
 * satisfy a specified predicate.
 *
 * <span class="informal">Like
 * [Array.prototype.filter()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter),
 * it only emits a value from the source if it passes a criterion function.</span>
 *
 * ![](filter.png)
 *
 * Similar to the well-known `Array.prototype.filter` method, this operator
 * takes values from the source Observable, passes them through a `predicate`
 * function and only emits those values that yielded `true`.
 *
 * ## Example
 * Emit only click events whose target was a DIV element
 * ```ts
 * import { fromEvent } from 'rxjs';
 * import { filter } from 'rxjs/operators';
 *
 * const clicks = fromEvent(document, 'click');
 * const clicksOnDivs = clicks.pipe(filter(ev => ev.target.tagName === 'DIV'));
 * clicksOnDivs.subscribe(x => console.log(x));
 * ```
 *
 * @see {@link distinct}
 * @see {@link distinctUntilChanged}
 * @see {@link distinctUntilKeyChanged}
 * @see {@link ignoreElements}
 * @see {@link partition}
 * @see {@link skip}
 *
 * @param predicate A function that
 * evaluates each value emitted by the source Observable. If it returns `true`,
 * the value is emitted, if `false` the value is not passed to the output
 * Observable. The `index` parameter is the number `i` for the i-th source
 * emission that has happened since the subscription, starting from the number
 * `0`.
 * @param thisArg An optional argument to determine the value of `this`
 * in the `predicate` function.
 */
export function filter<T>(predicate: (value: T, index: number) => boolean, thisArg?: any): MonoTypeOperatorFunction<T> {
  return operate((source, subscriber) => {
    // An index passed to our predicate function on each call.
    let index = 0;

    // Subscribe to the source, all errors and completions are
    // forwarded to the consumer.
    source.subscribe(
      // Call the predicate with the appropriate `this` context,
      // if the predicate returns `true`, then send the value
      // to the consumer.
      new OperatorSubscriber(subscriber, (value) => predicate.call(thisArg, value, index++) && subscriber.next(value))
    );
  });
}
