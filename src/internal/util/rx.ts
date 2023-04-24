import { from } from '../observable/from';
import { Observable } from '../Observable';
import { ObservableInput, UnaryFunction } from '../types';
import { pipeFromArray } from './pipe';

export function rx<T, A>(source: ObservableInput<A>): Observable<A>;
export function rx<T, A, B>(source: ObservableInput<A>, fn2: UnaryFunction<Observable<A>, B>): B;
export function rx<T, A, B, C>(source: ObservableInput<A>, fn2: UnaryFunction<Observable<A>, B>, fn3: UnaryFunction<B, C>): C;
export function rx<T, A, B, C, D>(
  source: ObservableInput<A>,
  fn2: UnaryFunction<Observable<A>, B>,
  fn3: UnaryFunction<B, C>,
  fn4: UnaryFunction<C, D>
): D;
export function rx<T, A, B, C, D, E>(
  source: ObservableInput<A>,
  fn2: UnaryFunction<Observable<A>, B>,
  fn3: UnaryFunction<B, C>,
  fn4: UnaryFunction<C, D>,
  fn5: UnaryFunction<D, E>
): E;
export function rx<T, A, B, C, D, E, F>(
  source: ObservableInput<A>,
  fn2: UnaryFunction<Observable<A>, B>,
  fn3: UnaryFunction<B, C>,
  fn4: UnaryFunction<C, D>,
  fn5: UnaryFunction<D, E>,
  fn6: UnaryFunction<E, F>
): F;
export function rx<T, A, B, C, D, E, F, G>(
  source: ObservableInput<A>,
  fn2: UnaryFunction<Observable<A>, B>,
  fn3: UnaryFunction<B, C>,
  fn4: UnaryFunction<C, D>,
  fn5: UnaryFunction<D, E>,
  fn6: UnaryFunction<E, F>,
  fn7: UnaryFunction<F, G>
): G;
export function rx<T, A, B, C, D, E, F, G, H>(
  source: ObservableInput<A>,
  fn2: UnaryFunction<Observable<A>, B>,
  fn3: UnaryFunction<B, C>,
  fn4: UnaryFunction<C, D>,
  fn5: UnaryFunction<D, E>,
  fn6: UnaryFunction<E, F>,
  fn7: UnaryFunction<F, G>,
  fn8: UnaryFunction<G, H>
): H;
export function rx<T, A, B, C, D, E, F, G, H, I>(
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
export function rx<T, A, B, C, D, E, F, G, H, I>(
  source: ObservableInput<A>,
  fn2: UnaryFunction<Observable<A>, B>,
  fn3: UnaryFunction<B, C>,
  fn4: UnaryFunction<C, D>,
  fn5: UnaryFunction<D, E>,
  fn6: UnaryFunction<E, F>,
  fn7: UnaryFunction<F, G>,
  fn8: UnaryFunction<G, H>,
  fn9: UnaryFunction<H, I>,
  ...fns: UnaryFunction<any, any>[]
): unknown;

/**
 * Converts the first argument to an observable, then passes that observable to the function in the second argument.
 * The result of _that_ function is then passed to the function in the third argument, and so on. This continues until
 * all functions have been called, and the result of the last function is returned.
 *
 * This means it can be used for anything involving unary functions, just so long as the first unary function accepts an observable as its argument,
 * and as long as the first argument to `r()` is a valid {@link ObservableInput}.
 *
 * This is the same as an ordinary functional {@link pipe}, except it has an implicit `from` as the second argument.
 *
 * The following are equivalent:
 *
 * ```ts
 * r(source, map(x => x + 1), filter(x => x % 2 === 0));
 * pipe(from(source), map(x => x + 1), filter(x => x % 2 === 0));
 * pipe(source, from, map(x => x + 1), filter(x => x % 2 === 0));
 * ```
 *
 * Furthermore, `r` can be used to create an observable and pipe it in any number of ways. For example:
 *
 * ```ts
 * const subscription = r(
 *   of(1, 2, 3),
 *   source => source.subscribe(x => console.log(x)),
 * );
 *
 * // or even something like this:
 * const promise = r(
 *   of(1, 2, 3),
 *   async (source) => {
 *     const result = [];
 *     await source.forEach(x => result.push(x));
 *     return result;
 *   },
 * });
 * ````
 */
export function rx(...args: unknown[]): unknown {
  const [source, ...fns] = args as [ObservableInput<unknown>, ...UnaryFunction<any, any>[]];
  return pipeFromArray(fns)(from(source));
}
