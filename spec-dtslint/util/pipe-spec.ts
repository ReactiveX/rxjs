import { pipe, UnaryFunction, of, Observable } from 'rxjs';

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

it('should infer {} for no arguments', () => {
  const o = pipe(); // $ExpectType UnaryFunction<{}, {}>
});

it('should infer for 1 argument', () => {
  const o = pipe(a('0', '1')); // $ExpectType UnaryFunction<"0", "1">
});

it('should infer for 2 arguments', () => {
  const o = pipe(a('0', '1'), a('1', '2')); // $ExpectType UnaryFunction<"0", "2">
});

it('should infer for 3 arguments', () => {
  const o = pipe(a('0', '1'), a('1', '2'), a('2', '3')); // $ExpectType UnaryFunction<"0", "3">
});

it('should infer for 4 arguments', () => {
  const o = pipe(a('0', '1'), a('1', '2'), a('2', '3'), a('3', '4')); // $ExpectType UnaryFunction<"0", "4">
});

it('should infer for 5 arguments', () => {
  const o = pipe(a('0', '1'), a('1', '2'), a('2', '3'), a('3', '4'), a('4', '5')); // $ExpectType UnaryFunction<"0", "5">
});

it('should infer for 6 arguments', () => {
  const o = pipe(a('0', '1'), a('1', '2'), a('2', '3'), a('3', '4'), a('4', '5'), a('5', '6')); // $ExpectType UnaryFunction<"0", "6">
});

it('should infer for 7 arguments', () => {
  const o = pipe(a('0', '1'), a('1', '2'), a('2', '3'), a('3', '4'), a('4', '5'), a('5', '6'), a('6', '7')); // $ExpectType UnaryFunction<"0", "7">
});

it('should infer for 8 arguments', () => {
  const o = pipe(a('0', '1'), a('1', '2'), a('2', '3'), a('3', '4'), a('4', '5'), a('5', '6'), a('6', '7'), a('7', '8')); // $ExpectType UnaryFunction<"0", "8">
});

it('should infer for 9 arguments', () => {
  const o = pipe(a('0', '1'), a('1', '2'), a('2', '3'), a('3', '4'), a('4', '5'), a('5', '6'), a('6', '7'), a('7', '8'), a('8', '9')); // $ExpectType UnaryFunction<"0", "9">
});

it('should infer {} for more than 9 arguments', () => {
  const o =  pipe(a('0', '1'), a('1', '2'), a('2', '3'), a('3', '4'), a('4', '5'), a('5', '6'), a('6', '7'), a('7', '8'), a('8', '9'), a('9', '10'));  // $ExpectType UnaryFunction<"0", {}>
});

it('should require a type assertion for more than 9 arguments', () => {
  const o: UnaryFunction<'0', '10'> = pipe(a('0', '1'), a('1', '2'), a('2', '3'), a('3', '4'), a('4', '5'), a('5', '6'), a('6', '7'), a('7', '8'), a('8', '9'), a('9', '10')); // $ExpectError
});

it('should enforce types for the 2nd argument', () => {
  const o = pipe(a('0', '1'), a('#', '2')); // $ExpectError
});

it('should enforce types for the 3rd argument', () => {
  const o = pipe(a('0', '1'), a('1', '2'), a('#', '3')); // $ExpectError
});

it('should enforce types for the 4th argument', () => {
  const o = pipe(a('0', '1'), a('1', '2'), a('2', '3'), a('#', '4')); // $ExpectError
});

it('should enforce types for the 5th argument', () => {
  const o = pipe(a('0', '1'), a('1', '2'), a('2', '3'), a('3', '4'), a('#', '5')); // $ExpectError
});

it('should enforce types for the 6th argument', () => {
  const o = pipe(a('0', '1'), a('1', '2'), a('2', '3'), a('3', '4'), a('4', '5'), a('#', '6')); // $ExpectError
});

it('should enforce types for the 7th argument', () => {
  const o = pipe(a('0', '1'), a('1', '2'), a('2', '3'), a('3', '4'), a('4', '5'), a('5', '6'), a('#', '7')); // $ExpectError
});

it('should enforce types for the 8th argument', () => {
  const o = pipe(a('0', '1'), a('1', '2'), a('2', '3'), a('3', '4'), a('4', '5'), a('5', '6'), a('6', '7'), a('#', '8')); // $ExpectError
});

it('should enforce types for the 9th argument', () => {
  const o = pipe(a('0', '1'), a('1', '2'), a('2', '3'), a('3', '4'), a('4', '5'), a('5', '6'), a('6', '7'), a('7', '8'), a('#', '9')); // $ExpectError
});

it('should return a non-narrowed Observable type', () => {
  const customOperator = <T>(p: T) => (a: Observable<T>) => a;

  const staticPipe = pipe(customOperator('infer'));
  const o = of('foo').pipe(staticPipe); // $ExpectType Observable<string>
});

it('should return an explicit Observable type', () => {
  const customOperator = <T>() => (a: Observable<T>) => a;

  const staticPipe = pipe(customOperator<string>());
  const o = of('foo').pipe(staticPipe); // $ExpectType Observable<string>
});

it('should return Observable<{}> when T cannot be inferred', () => {
  const customOperator = <T>() => (a: Observable<T>) => a;

  // type can't be possibly be inferred here, so it's {} instead of T.
  const staticPipe = pipe(customOperator());
  const o = of('foo').pipe(staticPipe); // $ExpectType Observable<{}>
});

it('should return a non-narrowed type', () => {
  const func = pipe((value: string) => value, (value: string) => value + value);
  const value = func('foo'); // $ExpectType string
});
