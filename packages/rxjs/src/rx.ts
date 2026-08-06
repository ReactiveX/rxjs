import type { UnaryFunction } from './pipeable/types.js';

/**
 * Converts an input with the active platform `Observable.from`, then applies
 * unary functions from left to right.
 *
 * The first function receives `Observable<T>`. Each following function
 * receives the exact result of the preceding function, so `rx` can return an
 * Observable, a subscription handle, or any other final value.
 *
 * TypeScript tracks the first nine transformations precisely. Longer chains
 * are accepted, but their result is `unknown` because TypeScript cannot express
 * an unbounded heterogeneous function chain without either an overload horizon
 * or materially more expensive recursive tuple types. Every overload also
 * adds work to overload resolution; for exceptionally large pipelines, split
 * the chain into named, typed functions to improve diagnostics and checking
 * time.
 *
 * @typeParam T The value produced by the converted input.
 * @param input A platform Observable, iterable, async iterable, or Promise-like
 * value accepted by `Observable.from`.
 * @param functions Unary functions applied from left to right.
 * @returns The converted Observable when no functions are supplied, otherwise
 * the final function's result.
 *
 * @example Compose pipeable operators over an iterable
 * ```ts
 * import { filter, map, rx } from 'rxjs';
 *
 * const result = rx(
 *   [1, 2, 3, 4],
 *   filter((value) => value % 2 === 0),
 *   map((value) => value * 10)
 * );
 *
 * result.subscribe(console.log); // 20, 40
 * ```
 *
 * @example Return a non-Observable final value
 * ```ts
 * import { rx } from 'rxjs';
 *
 * const label = rx([1, 2, 3], () => 'ready' as const);
 * // label has type 'ready'
 * ```
 */
export function rx<T>(input: ObservableInput<T>): Observable<T>;
export function rx<T, A>(input: ObservableInput<T>, fn1: UnaryFunction<Observable<T>, A>): A;
export function rx<T, A, B>(input: ObservableInput<T>, fn1: UnaryFunction<Observable<T>, A>, fn2: UnaryFunction<A, B>): B;
export function rx<T, A, B, C>(
  input: ObservableInput<T>,
  fn1: UnaryFunction<Observable<T>, A>,
  fn2: UnaryFunction<A, B>,
  fn3: UnaryFunction<B, C>
): C;
export function rx<T, A, B, C, D>(
  input: ObservableInput<T>,
  fn1: UnaryFunction<Observable<T>, A>,
  fn2: UnaryFunction<A, B>,
  fn3: UnaryFunction<B, C>,
  fn4: UnaryFunction<C, D>
): D;
export function rx<T, A, B, C, D, E>(
  input: ObservableInput<T>,
  fn1: UnaryFunction<Observable<T>, A>,
  fn2: UnaryFunction<A, B>,
  fn3: UnaryFunction<B, C>,
  fn4: UnaryFunction<C, D>,
  fn5: UnaryFunction<D, E>
): E;
export function rx<T, A, B, C, D, E, F>(
  input: ObservableInput<T>,
  fn1: UnaryFunction<Observable<T>, A>,
  fn2: UnaryFunction<A, B>,
  fn3: UnaryFunction<B, C>,
  fn4: UnaryFunction<C, D>,
  fn5: UnaryFunction<D, E>,
  fn6: UnaryFunction<E, F>
): F;
export function rx<T, A, B, C, D, E, F, G>(
  input: ObservableInput<T>,
  fn1: UnaryFunction<Observable<T>, A>,
  fn2: UnaryFunction<A, B>,
  fn3: UnaryFunction<B, C>,
  fn4: UnaryFunction<C, D>,
  fn5: UnaryFunction<D, E>,
  fn6: UnaryFunction<E, F>,
  fn7: UnaryFunction<F, G>
): G;
export function rx<T, A, B, C, D, E, F, G, H>(
  input: ObservableInput<T>,
  fn1: UnaryFunction<Observable<T>, A>,
  fn2: UnaryFunction<A, B>,
  fn3: UnaryFunction<B, C>,
  fn4: UnaryFunction<C, D>,
  fn5: UnaryFunction<D, E>,
  fn6: UnaryFunction<E, F>,
  fn7: UnaryFunction<F, G>,
  fn8: UnaryFunction<G, H>
): H;
export function rx<T, A, B, C, D, E, F, G, H, I>(
  input: ObservableInput<T>,
  fn1: UnaryFunction<Observable<T>, A>,
  fn2: UnaryFunction<A, B>,
  fn3: UnaryFunction<B, C>,
  fn4: UnaryFunction<C, D>,
  fn5: UnaryFunction<D, E>,
  fn6: UnaryFunction<E, F>,
  fn7: UnaryFunction<F, G>,
  fn8: UnaryFunction<G, H>,
  fn9: UnaryFunction<H, I>
): I;
export function rx<T, A, B, C, D, E, F, G, H, I>(
  input: ObservableInput<T>,
  fn1: UnaryFunction<Observable<T>, A>,
  fn2: UnaryFunction<A, B>,
  fn3: UnaryFunction<B, C>,
  fn4: UnaryFunction<C, D>,
  fn5: UnaryFunction<D, E>,
  fn6: UnaryFunction<E, F>,
  fn7: UnaryFunction<F, G>,
  fn8: UnaryFunction<G, H>,
  fn9: UnaryFunction<H, I>,
  ...functions: UnaryFunction<any, any>[]
): unknown;
export function rx(input: ObservableInput<unknown>, ...functions: UnaryFunction<any, any>[]): unknown {
  let result: unknown = Observable.from(input);

  for (const fn of functions) {
    result = fn(result);
  }

  return result;
}
