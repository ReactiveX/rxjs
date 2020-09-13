import { Subscriber } from '../Subscriber';
import { Observable } from '../Observable';
import { OperatorFunction } from '../types';
import { lift } from '../util/lift';

/**
 * Applies a given `project` function to each value emitted by the source
 * Observable, and emits the resulting values as an Observable.
 *
 * <span class="informal">Like [Array.prototype.map()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map),
 * it passes each source value through a transformation function to get
 * corresponding output values.</span>
 *
 * ![](map.png)
 *
 * Similar to the well known `Array.prototype.map` function, this operator
 * applies a projection to each value and emits that projection in the output
 * Observable.
 *
 * ## Example
 * Map every click to the clientX position of that click
 * ```ts
 * import { fromEvent } from 'rxjs';
 * import { map } from 'rxjs/operators';
 *
 * const clicks = fromEvent(document, 'click');
 * const positions = clicks.pipe(map(ev => ev.clientX));
 * positions.subscribe(x => console.log(x));
 * ```
 *
 * @see {@link mapTo}
 * @see {@link pluck}
 *
 * @param {function(value: T, index: number): R} project The function to apply
 * to each `value` emitted by the source Observable. The `index` parameter is
 * the number `i` for the i-th emission that has happened since the
 * subscription, starting from the number `0`.
 * @param {any} [thisArg] An optional argument to define what `this` is in the
 * `project` function.
 * @return {Observable<R>} An Observable that emits the values from the source
 * Observable transformed by the given `project` function.
 * @name map
 */
export function map<T, R>(project: (value: T, index: number) => R, thisArg?: any): OperatorFunction<T, R> {

  return function mapOperation(source: Observable<T>): Observable<R> {
    if (typeof project !== 'function') {
      throw new TypeError('argument is not a function. Are you looking for `mapTo()`?');
    }
    return lift(source, function (this: Subscriber<R>, source: Observable<T>) {
      const subscriber = this;
      // The index of the value from the source. Used with projection.
      let index = 0;
      source.subscribe(new MapSubscriber(subscriber, (value: T) => {
        // Try the projection, and catch any errors so we can send them to the consumer
        // as an error notification.
        let result: R;
        try {
          // Call with the `thisArg`. At some point we want to get rid of this,
          // as `fn.bind()` is more explicit and easier to read, however... as a
          // note, if no `thisArg` is passed, the `this` context will be `undefined`,
          // as no other default makes sense.
          result = project.call(thisArg, value, index++)
        } catch (err) {
          // Notify the consumer of the error.
          subscriber.error(err);
          return;
        }
        // Success! Send the projected result to the consumer
        subscriber.next(result);
      }))
    });
  };
}

class MapSubscriber<T> extends Subscriber<T> {
  constructor(destination: Subscriber<any>, protected _next: (value: T) => void) {
    super(destination);
  }
}