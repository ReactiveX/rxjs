import { reduce } from './reduce';
import { OperatorFunction } from '../types';

/**
 * The Average operator operates on an Observable that emits numbers (or items that contain a number that can be accessed with a provided function),
 * and when source Observable completes it emits the average of the emitted numbers.
 *
 * <img src="./img/average.png" width="100%">
 *
 * ## Examples
 * Get the average of a series of numbers
 * ```javascript
 * of(5, 4, 7, 2, 8).pipe(
 *   average(),
 * )
 * .subscribe(x => console.log(x)); // -> 5.2
 * ```
 *
 * Use a accessor function to get the average of a nested property in a set of objects
 * ```typescript
 * interface Person {
 *   age: number,
 *   name: string
 * }
 * of<Person>(
 *   {age: 7, name: 'Foo'},
 *   {age: 5, name: 'Bar'},
 *   {age: 9, name: 'Beer'},
 * ).pipe(
 *   average<Person>((x: Person) => x.age),
 * )
 * .subscribe((x: number) => console.log(x)); // -> 7
 * ```
 *
 * @see {@link max}
 * @see {@link min}
 * @see {@link sum}
 *
 * @param {Function} [accessor] - Optional accessor function that will access a nested value.
 * @return {Observable} An Observable that emits average of the values.
 * @method average
 * @owner Observable
 */
export function average<T>(accessor?: (x: T) => number, initialValue: number = 0): OperatorFunction<T, number> | OperatorFunction<number, number> {
  const averageReducer: (avg: number, val: T | number) => number = (typeof accessor === 'function')
    ? ((sum: number, count: number) =>
       (avg: number, val: T | number) =>
         typeof accessor(val as T) === 'number' ? (sum += accessor(val as T)) / ++count : avg)(0, 0)
    : ((sum: number, count: number) => (avg: number, val: T | number) => typeof val === 'number' ? (sum += val) / ++count : avg)(0, 0);

  return reduce(averageReducer, initialValue);
}