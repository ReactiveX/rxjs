import { of, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';
import { concatMapTo } from 'rxjs/operators';

it('should infer correctly', () => {
  expectType<Observable<string>>(of(1, 2, 3).pipe(concatMapTo(of('foo'))));
});

it('should infer correctly with multiple types', () => {
  expectType<Observable<string | number>>(of(1, 2, 3).pipe(concatMapTo(of('foo', 4))));
});

it('should infer correctly with an array', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(concatMapTo([4, 5, 6])));
});

it('should infer correctly with a Promise', () => {
  expectType<Observable<string>>(of(1, 2, 3).pipe(concatMapTo(new Promise<string>(() => {}))));
});

it('should infer correctly by using the resultSelector first parameter', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(concatMapTo(of('foo'), a => a)));
});

it('should infer correctly by using the resultSelector second parameter', () => {
  expectType<Observable<string>>(of(1, 2, 3).pipe(concatMapTo(of('foo'), (a, b) => b)));
});

it('should support a resultSelector that takes an inner index', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(concatMapTo(of('foo'), (a, b, innnerIndex) => a)));
});

it('should support a resultSelector that takes an inner and outer index', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(concatMapTo(of('foo'), (a, b, innnerIndex, outerIndex) => a)));
});

it('should support an undefined resultSelector', () => {
  expectType<Observable<string>>(of(1, 2, 3).pipe(concatMapTo(of('foo'), undefined)));
});

it('should support union types', () => {
  const s = Math.random() > 0.5 ? of(123) : of('abc');
  expectType<Observable<string | number>>(of(1, 2, 3).pipe(concatMapTo(s)));
});

it('should enforce types', () => {
  expectError(of(1, 2, 3).pipe(concatMapTo()));
});

it('should enforce the return type', () => {
  expectError(of(1, 2, 3).pipe(concatMapTo(p => p)));
  expectError(of(1, 2, 3).pipe(concatMapTo(4)));
});
