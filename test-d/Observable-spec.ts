import { Observable, of, OperatorFunction, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';
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
    expectType<Observable<string>>(of('foo').pipe());
  });

  it('should infer for 1 argument', () => {
    expectType<Observable<"1">>(of('foo').pipe(a('1')));
  });

  it('should infer for 2 arguments', () => {
    expectType<Observable<"2">>(of('foo').pipe(a('1'), a('2')));
  });

  it('should infer for 3 arguments', () => {
    expectType<Observable<"3">>(of('foo').pipe(a('1'), a('2'), a('3')));
  });

  it('should infer for 4 arguments', () => {
    expectType<Observable<"4">>(of('foo').pipe(a('1'), a('2'), a('3'), a('4')));
  });

  it('should infer for 5 arguments', () => {
    expectType<Observable<"5">>(of('foo').pipe(a('1'), a('2'), a('3'), a('4'), a('5')));
  });

  it('should infer for 6 arguments', () => {
    expectType<Observable<"6">>(of('foo').pipe(a('1'), a('2'), a('3'), a('4'), a('5'), a('6')));
  });

  it('should infer for 7 arguments', () => {
    expectType<Observable<"7">>(of('foo').pipe(a('1'), a('2'), a('3'), a('4'), a('5'), a('6'), a('7')));
  });

  it('should infer for 8 arguments', () => {
    expectType<Observable<"8">>(of('foo').pipe(a('1'), a('2'), a('3'), a('4'), a('5'), a('6'), a('7'), a('8')));
  });

  it('should infer for 9 arguments', () => {
    expectType<Observable<"9">>(of('foo').pipe(a('1'), a('2'), a('3'), a('4'), a('5'), a('6'), a('7'), a('8'), a('9')));
  });

  it('should infer unknown for more than 9 arguments', () => {
    expectType<Observable<unknown>>(of('foo').pipe(a('1'), a('2'), a('3'), a('4'), a('5'), a('6'), a('7'), a('8'), a('9'), a('10')));
  });

  it('should require a type assertion for more than 9 arguments', () => {
    expectError(of('foo').pipe(a('1'), a('2'), a('3'), a('4'), a('5'), a('6'), a('7'), a('8'), a('9'), a('10')));
  });

  it('should enforce types for the 1st argument', () => {
    expectError(of('foo').pipe(a('#', '1')));
  });

  it('should enforce types for the 2nd argument', () => {
    expectError(of('foo').pipe(a('1'), a('#', '2')));
  });

  it('should enforce types for the 3rd argument', () => {
    expectError(of('foo').pipe(a('1'), a('2'), a('#', '3')));
  });

  it('should enforce types for the 4th argument', () => {
    expectError(of('foo').pipe(a('1'), a('2'), a('3'), a('#', '4')));
  });

  it('should enforce types for the 5th argument', () => {
    expectError(of('foo').pipe(a('1'), a('2'), a('3'), a('4'), a('#', '5')));
  });

  it('should enforce types for the 6th argument', () => {
    expectError(of('foo').pipe(a('1'), a('2'), a('3'), a('4'), a('5'), a('#', '6')));
  });

  it('should enforce types for the 7th argument', () => {
    expectError(of('foo').pipe(a('1'), a('2'), a('3'), a('4'), a('5'), a('6'), a('#', '7')));
  });

  it('should enforce types for the 8th argument', () => {
    expectError(of('foo').pipe(a('1'), a('2'), a('3'), a('4'), a('5'), a('6'), a('7'), a('#', '8')));
  });

  it('should enforce types for the 9th argument', () => {
    expectError(of('foo').pipe(a('1'), a('2'), a('3'), a('4'), a('5'), a('6'), a('7'), a('8'), a('#', '9')));
  });

  it('should not enforce types beyond the 9th argument', () => {
    expectType<Observable<unknown>>(of('foo').pipe(a('1'), a('2'), a('3'), a('4'), a('5'), a('6'), a('7'), a('8'), a('9'), a('#', '10')));
  });

  it('should support operators that return generics', () => {
    const customOperator = () => <T>(a: Observable<T>) => a;
    expectType<Observable<string>>(of('foo').pipe(customOperator()));
  });
});
