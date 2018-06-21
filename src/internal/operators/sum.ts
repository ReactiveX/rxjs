import { reduce } from './reduce';
import { OperatorFunction } from '../types';
import { isNumeric } from 'rxjs/util/isNumeric';

/**
 * The Sum operator operates on an Observable that emits numbers (or items that contain a number that can be accessed with a provided function),
 * and when source Observable completes it emits the sum of the emitted numbers.
 *
 * <img src="./img/sum.png" width="100%">
 *
 * ## Examples
 * Get the sum of a series of numbers
 * ```javascript
 * of(5, 4, 7, 2, 8).pipe(
 *   sum(),
 * )
 * .subscribe(x => console.log(x)); // -> 26
 * ```
 *
 * Use a accessor function to get the sum of a nested property in a set of objects
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
 *   sum<Person>((x: Person) => x.age),
 * )
 * .subscribe((x: number) => console.log(x)); // -> 21
 * ```
 *
 * @see {@link average}
 * @see {@link max}
 * @see {@link min}
 *
 * @param {Function} [accessor] - Optional accessor function that will access a nested value.
 * @return {Observable} An Observable that emits sum of the values.
 * @method sum
 * @owner Observable
 */
export function sum<T>(accessor?: (x: T) => number): OperatorFunction<T, number> | OperatorFunction<number, number> {
  const sumReducer: (acc: number, val: T | number) => number = (typeof accessor === 'function')
      ? (acc: number, val: T | number) => acc + (isNumeric(accessor(val as T)) ? accessor(val as T) : 0)
      : (acc: number, val: T | number) => acc + (isNumeric(val as number) ? val as number : 0);

  return reduce(sumReducer, 0);
}