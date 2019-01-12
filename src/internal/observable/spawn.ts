import { async } from './async';

// REVIEWER: Do I need to spell out every category of `ObservableInput`, or
// can I just call them observables?

/**
 * Spawns a generator function which allows for Promises, Observable
 * sequences, Arrays, Objects, Generators and functions.
 *
 * ## Example
 *
 * ```javascript
 * import { of } from 'rxjs/observable/of'
 * import { spawn } from 'rxjs/observable/spawn'
 *
 * const spawned = spawn(function* () {
 *   const a = yield ['a'];
 *   const b = yield of('b');
 *   const c = yield Promise.resolve('c');
 *   return a + b + c;
 * });
 *
 * spawned.subscribe(
 *   (x) => console.log('next %s', x),
 *   (e) => console.log('error %s', e),
 *   () => console.log('completed')
 * );
 *
 * // Logs:
 * // next 'abc'
 * // completed
 * ```
 *
 * @param {() => Iterator<ObservableInput<any> | T>} A generator function that
 * yields intermediate observables on its way to returning a final value.
 * @returns {Observable<T>} An observable with the final value.
 * @name spawn
 */
export function spawn(f: () => Iterator<any>) {
  return async(f)();
}
