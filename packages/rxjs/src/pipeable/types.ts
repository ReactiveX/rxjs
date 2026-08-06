/**
 * Any value accepted by the active realm's platform `Observable.from`.
 *
 * @typeParam T The values produced after conversion.
 *
 * @example Convert an iterable before applying RxJS operators
 * ```ts
 * import { rx, map, type ObservableInput } from 'rxjs';
 *
 * const input: ObservableInput<number> = [1, 2, 3];
 * const doubled = rx(input, map((value) => value * 2));
 *
 * doubled.subscribe(console.log); // 2, 4, 6
 * ```
 */
export type ObservableInput<T> = ObservableValue<T>;

/**
 * A function that accepts one value and returns another.
 *
 * `rx` composes unary functions from left to right. RxJS operators are the
 * common case, but the final function may return any value.
 *
 * @typeParam T The input type.
 * @typeParam R The output type.
 */
export interface UnaryFunction<T, R> {
  (source: T): R;
}

/**
 * A pipeable RxJS operator that transforms an `Observable<T>` into an
 * `Observable<R>`.
 *
 * @typeParam T The source value type.
 * @typeParam R The result value type.
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
export type OperatorFunction<T, R> = UnaryFunction<Observable<T>, Observable<R>>;

/**
 * A pipeable operator that preserves its source value type.
 *
 * @typeParam T The source and result value type.
 */
export type MonoTypeOperatorFunction<T> = OperatorFunction<T, T>;

/** @internal */
export type Falsy = null | undefined | false | 0 | -0 | 0n | '';

/** @internal */
export type TruthyTypesOf<T> = T extends Falsy ? never : T;
