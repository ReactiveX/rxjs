/**
 * A function that accepts one value and returns another.
 *
 * `rx` composes unary functions from left to right. RxJS operators are the
 * common case, but the final function may return any value.
 *
 * @typeParam In The input type.
 * @typeParam Out The output type.
 */
export type UnaryFunction<In, Out> = (source: In) => Out;

/**
 * A pipeable RxJS operator that transforms an `Observable<In>` into an
 * `Observable<Out>`.
 *
 * @typeParam In The source value type.
 * @typeParam Out The result value type.
 *
 * @example Declare a reusable operator
 * ```ts
 * import { map, rx, type OperatorFunction } from 'rxjs';
 *
 * const stringify: OperatorFunction<number, string> = map(String);
 * const values = rx([1, 2, 3], stringify);
 *
 * values.subscribe(console.log); // '1', '2', '3'
 * ```
 */
export type OperatorFunction<In, Out> = (source: Observable<In>) => Observable<Out>;

/** @internal */
export type Falsy = null | undefined | false | 0 | -0 | 0n | '';

/** @internal */
export type TruthyTypesOf<T> = T extends Falsy ? never : T;
