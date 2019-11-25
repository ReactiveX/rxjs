import { pipe, UnaryFunction, of, Observable, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';

/**
 * Used to keep the tests uncluttered.
 *
 * Returns a `UnaryFunction` with the
 * specified literal type parameters.
 * That is, `a('0', '1')` returns `UnaryFunction<'0', '1'>`.
 * That means that the `a` function can be used to create consecutive
 * arguments that are either compatible or incompatible.
 *
 * ```js
 * a('0', '1'), a('1', '2') // OK
 * a('0', '1'), a('#', '2') // Error '1' is not compatible with '#'
 * ```
 *
 * @param {string} input The `UnaryFunction` input type parameter
 * @param {string} output The `UnaryFunction` output type parameter
 */
function a<I extends string, O extends string>(input: I, output: O): UnaryFunction<I, O> {
  return i => output;
}

it('should infer unknown for no arguments', () => {
  expectType<UnaryFunction<unknown, unknown>>(pipe());
});

it('should infer for 1 argument', () => {
  expectType<UnaryFunction<"0", "1">>(pipe(a('0', '1')));
});

it('should infer for 2 arguments', () => {
  expectType<UnaryFunction<"0", "2">>(pipe(a('0', '1'), a('1', '2')));
});

it('should infer for 3 arguments', () => {
  expectType<UnaryFunction<"0", "3">>(pipe(a('0', '1'), a('1', '2'), a('2', '3')));
});

it('should infer for 4 arguments', () => {
  expectType<UnaryFunction<"0", "4">>(pipe(a('0', '1'), a('1', '2'), a('2', '3'), a('3', '4')));
});

it('should infer for 5 arguments', () => {
  expectType<UnaryFunction<"0", "5">>(pipe(a('0', '1'), a('1', '2'), a('2', '3'), a('3', '4'), a('4', '5')));
});

it('should infer for 6 arguments', () => {
  expectType<UnaryFunction<"0", "6">>(pipe(a('0', '1'), a('1', '2'), a('2', '3'), a('3', '4'), a('4', '5'), a('5', '6')));
});

it('should infer for 7 arguments', () => {
  expectType<UnaryFunction<"0", "7">>(pipe(a('0', '1'), a('1', '2'), a('2', '3'), a('3', '4'), a('4', '5'), a('5', '6'), a('6', '7')));
});

it('should infer for 8 arguments', () => {
  expectType<UnaryFunction<"0", "8">>(pipe(a('0', '1'), a('1', '2'), a('2', '3'), a('3', '4'), a('4', '5'), a('5', '6'), a('6', '7'), a('7', '8')));
});

it('should infer for 9 arguments', () => {
  expectType<UnaryFunction<"0", "9">>(pipe(a('0', '1'), a('1', '2'), a('2', '3'), a('3', '4'), a('4', '5'), a('5', '6'), a('6', '7'), a('7', '8'), a('8', '9')));
});

it('should infer {} for more than 9 arguments', () => {
  const o =  pipe(a('0', '1'), a('1', '2'), a('2', '3'), a('3', '4'), a('4', '5'), a('5', '6'), a('6', '7'), a('7', '8'), a('8', '9'), a('9', '10'));  // $ExpectType UnaryFunction<"0", {}>
});

it('should require a type assertion for more than 9 arguments', () => {
  expectError(pipe(a('0', '1'), a('1', '2'), a('2', '3'), a('3', '4'), a('4', '5'), a('5', '6'), a('6', '7'), a('7', '8'), a('8', '9'), a('9', '10')));
});

it('should enforce types for the 2nd argument', () => {
  expectError(pipe(a('0', '1'), a('#', '2')));
});

it('should enforce types for the 3rd argument', () => {
  expectError(pipe(a('0', '1'), a('1', '2'), a('#', '3')));
});

it('should enforce types for the 4th argument', () => {
  expectError(pipe(a('0', '1'), a('1', '2'), a('2', '3'), a('#', '4')));
});

it('should enforce types for the 5th argument', () => {
  expectError(pipe(a('0', '1'), a('1', '2'), a('2', '3'), a('3', '4'), a('#', '5')));
});

it('should enforce types for the 6th argument', () => {
  expectError(pipe(a('0', '1'), a('1', '2'), a('2', '3'), a('3', '4'), a('4', '5'), a('#', '6')));
});

it('should enforce types for the 7th argument', () => {
  expectError(pipe(a('0', '1'), a('1', '2'), a('2', '3'), a('3', '4'), a('4', '5'), a('5', '6'), a('#', '7')));
});

it('should enforce types for the 8th argument', () => {
  expectError(pipe(a('0', '1'), a('1', '2'), a('2', '3'), a('3', '4'), a('4', '5'), a('5', '6'), a('6', '7'), a('#', '8')));
});

it('should enforce types for the 9th argument', () => {
  expectError(pipe(a('0', '1'), a('1', '2'), a('2', '3'), a('3', '4'), a('4', '5'), a('5', '6'), a('6', '7'), a('7', '8'), a('#', '9')));
});

it('should return a non-narrowed Observable type', () => {
  const customOperator = <T>(p: T) => (a: Observable<T>) => a;

  const staticPipe = pipe(customOperator('infer'));
  expectType<Observable<string>>(of('foo').pipe(staticPipe));
});

it('should return an explicit Observable type', () => {
  const customOperator = <T>() => (a: Observable<T>) => a;

  const staticPipe = pipe(customOperator<string>());
  expectType<Observable<string>>(of('foo').pipe(staticPipe));
});

it('should return Observable<unknown> when T cannot be inferred', () => {
  const customOperator = <T>() => (a: Observable<T>) => a;

  // type can't be possibly be inferred here
  const staticPipe = pipe(customOperator());
  expectType<Observable<unknown>>(of('foo').pipe(staticPipe));
});

it('should return a non-narrowed type', () => {
  const func = pipe((value: string) => value, (value: string) => value + value);
  expectType<string>(func('foo'));
});
