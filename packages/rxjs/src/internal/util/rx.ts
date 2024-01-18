import type { Observable} from '@rxjs/observable';
import { from } from '@rxjs/observable';
import type { ObservableInput, UnaryFunction } from '../types.js';

export function rx<A>(source: ObservableInput<A>): Observable<A>;
export function rx<A, B>(source: ObservableInput<A>, fn2: UnaryFunction<Observable<A>, B>): B;
export function rx<A, B, C>(source: ObservableInput<A>, fn2: UnaryFunction<Observable<A>, B>, fn3: UnaryFunction<B, C>): C;
export function rx<A, B, C, D>(
  source: ObservableInput<A>,
  fn2: UnaryFunction<Observable<A>, B>,
  fn3: UnaryFunction<B, C>,
  fn4: UnaryFunction<C, D>
): D;
export function rx<A, B, C, D, E>(
  source: ObservableInput<A>,
  fn2: UnaryFunction<Observable<A>, B>,
  fn3: UnaryFunction<B, C>,
  fn4: UnaryFunction<C, D>,
  fn5: UnaryFunction<D, E>
): E;
export function rx<A, B, C, D, E, F>(
  source: ObservableInput<A>,
  fn2: UnaryFunction<Observable<A>, B>,
  fn3: UnaryFunction<B, C>,
  fn4: UnaryFunction<C, D>,
  fn5: UnaryFunction<D, E>,
  fn6: UnaryFunction<E, F>
): F;
export function rx<A, B, C, D, E, F, G>(
  source: ObservableInput<A>,
  fn2: UnaryFunction<Observable<A>, B>,
  fn3: UnaryFunction<B, C>,
  fn4: UnaryFunction<C, D>,
  fn5: UnaryFunction<D, E>,
  fn6: UnaryFunction<E, F>,
  fn7: UnaryFunction<F, G>
): G;
export function rx<A, B, C, D, E, F, G, H>(
  source: ObservableInput<A>,
  fn2: UnaryFunction<Observable<A>, B>,
  fn3: UnaryFunction<B, C>,
  fn4: UnaryFunction<C, D>,
  fn5: UnaryFunction<D, E>,
  fn6: UnaryFunction<E, F>,
  fn7: UnaryFunction<F, G>,
  fn8: UnaryFunction<G, H>
): H;
export function rx<A, B, C, D, E, F, G, H, I>(
  source: ObservableInput<A>,
  fn2: UnaryFunction<Observable<A>, B>,
  fn3: UnaryFunction<B, C>,
  fn4: UnaryFunction<C, D>,
  fn5: UnaryFunction<D, E>,
  fn6: UnaryFunction<E, F>,
  fn7: UnaryFunction<F, G>,
  fn8: UnaryFunction<G, H>,
  fn9: UnaryFunction<H, I>
): I;
export function rx<A, B, C, D, E, F, G, H, I>(
  source: ObservableInput<A>,
  fn2: UnaryFunction<Observable<A>, B>,
  fn3: UnaryFunction<B, C>,
  fn4: UnaryFunction<C, D>,
  fn5: UnaryFunction<D, E>,
  fn6: UnaryFunction<E, F>,
  fn7: UnaryFunction<F, G>,
  fn8: UnaryFunction<G, H>,
  fn9: UnaryFunction<H, I>,
  ...fns: UnaryFunction<unknown, unknown>[]
): unknown;

/**
 * Converts the first argument to an observable, then passes that observable to the function in the second argument.
 * The result of _that_ function is then passed to the function in the third argument, and so on. This continues until
 * all functions have been called, and the result of the last function is returned.
 *
 * This means it can be used for anything involving unary functions, just so long as the first unary function accepts an observable as its argument,
 * and as long as the first argument to `rx()` is a valid {@link ObservableInput}.
 *
 * This is the same as an ordinary functional {@link pipe}, except it has an implicit `from` as the second argument.
 *
 * The following are equivalent:
 *
 * ```ts
 * // Where `source` is any valid `ObservableInput`.
 * // A (observable, promise, array, async iterable, etc.)
 * rx(source, map(x => x + 1), filter(x => x % 2 === 0));
 * pipe(map(x => x + 1), filter(x => x % 2 === 0))(from(source));
 * pipe(from, map(x => x + 1), filter(x => x % 2 === 0))(source);
 * ```
 *
 * Furthermore, `rx` can be used to create an observable and pipe it in any number of ways. For example:
 *
 * ```ts
 * const subscription = rx(
 *   of(1, 2, 3),
 *   source => source.subscribe(x => console.log(x)),
 * );
 *
 * // or even something like this:
 * const promise = rx(
 *   of(1, 2, 3),
 *   async (source) => {
 *     const result = [];
 *     await source.forEach(x => result.push(x));
 *     return result;
 *   },
 * });
 * ````
 *
 * @param source Any valid observable source.
 * @param fns Any number of unary functions, starting with a unary function that accepts an observable as its only argument.
 * @returns The result of the last function, or an observable if no functions are provided for the second argument and beyond.
 */
export function rx(source: ObservableInput<unknown>, ...fns: UnaryFunction<any, unknown>[]): unknown {
  return fns.reduce(pipeReducer, from(source));
}

function pipeReducer(prev: any, fn: UnaryFunction<any, any>) {
  return fn(prev);
}
