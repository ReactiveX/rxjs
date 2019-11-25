import { of, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';
import { mergeMapTo } from 'rxjs/operators';

it('should infer correctly', () => {
  expectType<Observable<string>>(of(1, 2, 3).pipe(mergeMapTo(of('foo'))));
});

it('should infer correctly multiple types', () => {
  expectType<Observable<string | number>>(of(1, 2, 3).pipe(mergeMapTo(of('foo', 4))));
});

it('should infer correctly with an array', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(mergeMapTo([4, 5, 6])));
});

it('should infer correctly with a Promise', () => {
  expectType<Observable<string>>(of(1, 2, 3).pipe(mergeMapTo(new Promise<string>(() => {}))));
});

it('should support a concurrent parameter', () => {
  expectType<Observable<string>>(of(1, 2, 3).pipe(mergeMapTo(of('foo'), 4)));
});

it('should infer correctly by using the resultSelector first parameter', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(mergeMapTo(of('foo'), a => a)));
});

it('should infer correctly by using the resultSelector second parameter', () => {
  expectType<Observable<string>>(of(1, 2, 3).pipe(mergeMapTo(of('foo'), (a, b) => b)));
});

it('should support a resultSelector that takes an inner index', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(mergeMapTo(of('foo'), (a, b, innnerIndex) => a)));
});

it('should support a resultSelector that takes an inner and outer index', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(mergeMapTo(of('foo'), (a, b, innnerIndex, outerIndex) => a)));
});

it('should support a resultSelector and concurrent parameter', () => {
  expectType<Observable<string>>(of(1, 2, 3).pipe(mergeMapTo(of('foo'), (a, b) => b, 4)));
});

it('should support union types', () => {
  const s = Math.random() > 0.5 ? of(123) : of('abc');
  expectType<Observable<string | number>>(of(1, 2, 3).pipe(mergeMapTo(s)));
});

it('should enforce types', () => {
  expectError(of(1, 2, 3).pipe(mergeMapTo()));
});

it('should enforce the return type', () => {
  expectError(of(1, 2, 3).pipe(mergeMapTo(p => p)));
  expectError(of(1, 2, 3).pipe(mergeMapTo(4)));
});

it('should enforce types of the concurrent parameter', () => {
  expectError(of(1, 2, 3).pipe(mergeMapTo(of('foo'), '4')));
});

it('should enforce types of the concurrent parameter with a resultSelector', () => {
  expectError(of(1, 2, 3).pipe(mergeMapTo(of('foo'), (a => a), '4')));
});
