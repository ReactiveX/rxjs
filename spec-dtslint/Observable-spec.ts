import { Observable, of, OperatorFunction } from 'rxjs';
import { mapTo } from 'rxjs/operators';

function a<I extends string, O extends string>(input: I, output: O): OperatorFunction<I, O>;
function a<I, O extends string>(output: O): OperatorFunction<I, O>;

/**
 * Used to keep the tests uncluttered.
 *
 * Returns an `OperatorFunction` with the specified literal type parameters.
 * That is, `a('0', '1')` returns `OperatorFunction<'0', '1'>`.
 * That means that the `a` function can be used to create consecutive
 * arguments that are either compatible or incompatible.
 * 
 * ```javascript
 * a('0', '1'), a('1', '2') // OK
 * a('0', '1'), a('#', '2') // Error '1' is not compatible with '#'
 * ```
 *
 * If passed only one argument, that argument is used for the output
 * type parameter and the input type parameters is inferred.
 *
 * ```javascript
 * of('foo').pipe(
 *   a('1') // OperatorFunction<'foo', '1'>
 * );
 * ```
 *
 * @param {string} input The `OperatorFunction` input type parameter
 * @param {string} output The `OperatorFunction` output type parameter
 */
function a<I, O extends string>(inputOrOutput: I | O, output?: O): OperatorFunction<I, O> {
  return mapTo<I, O>(output === undefined ? inputOrOutput as O : output);
}

describe('pipe', () => {
  it('should infer for no arguments', () => {
    const o = of('foo').pipe(); // $ExpectType Observable<string>
  });

  it('should infer for 1 argument', () => {
    const o = of('foo').pipe(a('1')); // $ExpectType Observable<"1">
  });

  it('should infer for 2 arguments', () => {
    const o = of('foo').pipe(a('1'), a('2')); // $ExpectType Observable<"2">
  });

  it('should infer for 3 arguments', () => {
    const o = of('foo').pipe(a('1'), a('2'), a('3')); // $ExpectType Observable<"3">
  });

  it('should infer for 4 arguments', () => {
    const o = of('foo').pipe(a('1'), a('2'), a('3'), a('4')); // $ExpectType Observable<"4">
  });

  it('should infer for 5 arguments', () => {
    const o = of('foo').pipe(a('1'), a('2'), a('3'), a('4'), a('5')); // $ExpectType Observable<"5">
  });

  it('should infer for 6 arguments', () => {
    const o = of('foo').pipe(a('1'), a('2'), a('3'), a('4'), a('5'), a('6')); // $ExpectType Observable<"6">
  });

  it('should infer for 7 arguments', () => {
    const o = of('foo').pipe(a('1'), a('2'), a('3'), a('4'), a('5'), a('6'), a('7')); // $ExpectType Observable<"7">
  });

  it('should infer for 8 arguments', () => {
    const o = of('foo').pipe(a('1'), a('2'), a('3'), a('4'), a('5'), a('6'), a('7'), a('8')); // $ExpectType Observable<"8">
  });

  it('should infer for 9 arguments', () => {
    const o = of('foo').pipe(a('1'), a('2'), a('3'), a('4'), a('5'), a('6'), a('7'), a('8'), a('9')); // $ExpectType Observable<"9">
  });

  it('should infer {} for more than 9 arguments', () => {
    const o = of('foo').pipe(a('1'), a('2'), a('3'), a('4'), a('5'), a('6'), a('7'), a('8'), a('9'), a('10')); // $ExpectType Observable<{}>
  });

  it('should require a type assertion for more than 9 arguments', () => {
    const o: Observable<'10'> = of('foo').pipe(a('1'), a('2'), a('3'), a('4'), a('5'), a('6'), a('7'), a('8'), a('9'), a('10')); // $ExpectError
  });

  it('should enforce types for the 1st argument', () => {
    const o = of('foo').pipe(a('#', '1')); // $ExpectError
  });

  it('should enforce types for the 2nd argument', () => {
    const o = of('foo').pipe(a('1'), a('#', '2')); // $ExpectError
  });

  it('should enforce types for the 3rd argument', () => {
    const o = of('foo').pipe(a('1'), a('2'), a('#', '3')); // $ExpectError
  });

  it('should enforce types for the 4th argument', () => {
    const o = of('foo').pipe(a('1'), a('2'), a('3'), a('#', '4')); // $ExpectError
  });

  it('should enforce types for the 5th argument', () => {
    const o = of('foo').pipe(a('1'), a('2'), a('3'), a('4'), a('#', '5')); // $ExpectError
  });

  it('should enforce types for the 6th argument', () => {
    const o = of('foo').pipe(a('1'), a('2'), a('3'), a('4'), a('5'), a('#', '6')); // $ExpectError
  });

  it('should enforce types for the 7th argument', () => {
    const o = of('foo').pipe(a('1'), a('2'), a('3'), a('4'), a('5'), a('6'), a('#', '7')); // $ExpectError
  });

  it('should enforce types for the 8th argument', () => {
    const o = of('foo').pipe(a('1'), a('2'), a('3'), a('4'), a('5'), a('6'), a('7'), a('#', '8')); // $ExpectError
  });

  it('should enforce types for the 9th argument', () => {
    const o = of('foo').pipe(a('1'), a('2'), a('3'), a('4'), a('5'), a('6'), a('7'), a('8'), a('#', '9')); // $ExpectError
  });

  it('should not enforce types beyond the 9th argument', () => {
    const o = of('foo').pipe(a('1'), a('2'), a('3'), a('4'), a('5'), a('6'), a('7'), a('8'), a('9'), a('#', '10')); // $ExpectType Observable<{}>
  });

  it('should support operators that return generics', () => {
    const customOperator = () => <T>(a: Observable<T>) => a;
    const o = of('foo').pipe(customOperator()); // $ExpectType Observable<string>
  });
});
