import { MonoTypeOperatorFunction, TeardownLogic } from '../types';
import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';
import { Observable } from '../Observable';

/**
 * Returns an Observable that emits minimum value on each iteration.
 *
 * If a comparator function is provided, then it will be called for each item to test for whether or not that value should be emitted.
 *
 * If a comparator function is not provided, an equality check is used by default.
 *
 * ## Example
 * A simple example with numbers
 * ```javascript
 * of(1, 1, 2, 2, 2, 0, 1, 2, 3, -1, 4).pipe(
 *     minStream(),
 *   )
 *   .subscribe(x => console.log(x)); // 1, 1, 1, 1, 1, 0, 0, 0, 0, -1, -1
 * ```
 *
 * An example using a compare function
 * ```typescript
 * interface Person {
 *    age: number,
 *    name: string
 * }
 *
 * of<Person>(
 *     { age: 4, name: 'Foo'},
 *     { age: 7, name: 'Bar'},
 *     { age: 3, name: 'Foo'},
 *     { age: 6, name: 'Foo'},
 *   ).pipe(
 *     distinctUntilChanged((p: Person, q: Person) => p.age > q.age),
 *   )
 *   .subscribe(x => console.log(x));
 *
 * // displays:
 * // { age: 4, name: 'Foo' }
 * // { age: 4, name: 'Foo' }
 * // { age: 3, name: 'Foo'},
 * // { age: 3, name: 'Foo'},
 * ```
 *
 *
 * @param {function} [compare] Optional comparison function called to test if an item on iteration
 * @return {Observable} An Observable that emits minimum value on each iteration.
 * @method minStream
 * @owner Observable
 */

export function minStream<T>(comparer?: (x: T, y: T) => boolean): MonoTypeOperatorFunction<T> {
  return (source: Observable<T>) => source.lift(new MinStreamOperator<T>(comparer));
}

class MinStreamOperator<T> implements Operator<T, T> {
  constructor(private comparer: (x: T, y: T) => boolean) {}

  call(subscriber: Subscriber<T>, source: any): TeardownLogic {
    return source.subscribe(new MinStreamSubscriber<T>(subscriber, this.comparer));
  }
}

class MinStreamSubscriber<T> extends Subscriber<T> {
  private value: T;
  private hasValue: boolean = false;

  constructor(destination: Subscriber<T>, comparer: (x: T, y: T) => boolean) {
    super(destination);
    if (typeof comparer === 'function') {
      this.comparer = comparer;
    }
  }

  private comparer(x: T, y: T): boolean {
    return x > y ? true : false;
  }

  protected _next(value: T): void {
    if (!this.hasValue) {
      this.value = value;
      this.hasValue = true;
    } else {
      if (this.comparer(this.value, value)) {
        this.value = value;
      }
    }

    this.destination.next(this.value);
  }
}
