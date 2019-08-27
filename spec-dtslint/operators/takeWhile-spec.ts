import { of } from 'rxjs';
import { takeWhile } from 'rxjs/operators';

it('should support a user-defined type guard', () => {
  const o = of('foo').pipe(takeWhile((s): s is 'foo' => true)); // $ExpectType Observable<"foo">
});

it('should support a user-defined type guard with inclusive option', () => {
  const o = of('foo').pipe(takeWhile((s): s is 'foo' => true, false)); // $ExpectType Observable<"foo">
});

it('should support a predicate', () => {
  const o = of('foo').pipe(takeWhile(s => true)); // $ExpectType Observable<string>
});

it('should support a predicate with inclusive option', () => {
  const o = of('foo').pipe(takeWhile(s => true, true)); // $ExpectType Observable<string>
});

it('should support type narrowing', () => {
  function isString(x: any): x is string {
    return typeof x === 'string';
  }

  const o = of('a', 'b', 'c', 1, 2, 3).pipe(takeWhile(isString)); // $ExpectType Observable<string>
});

it('should handle inclusive properly with type narrowing', () => {
  function isString(x: any): x is string {
    return typeof x === 'string';
  }

  const source = of('a', true, 1);
  // NOTE: This seems to be an issue with TS 3.5.2, this should be Observable<string | number | boolean>
  const o = source.pipe(takeWhile(isString, true)); // $ExpectType Observable<any>
});

it('should support Boolean constructor as a predicate', () => {
  const o = of('foo').pipe(takeWhile(Boolean)); // $ExpectType Observable<string>
  const o2 = of(1, 2, 3, 4).pipe(takeWhile(Boolean, true)); // $ExpectType Observable<number>
  const o3 = of(1, 2, 3, 4, 'blah').pipe(takeWhile(Boolean, true)); // $ExpectType Observable<string | number>
});