import { of, asyncScheduler } from 'rxjs';
import { concat } from 'rxjs/operators';

it('should infer correctly', () => {
  const o = of(1, 2, 3).pipe(concat()); // $ExpectType Observable<number>
});

it('should support a scheduler', () => {
  const o = of(1, 2, 3).pipe(concat(asyncScheduler)); // $ExpectType Observable<number>
});

it('should support one argument', () => {
  const o = of(1, 2, 3).pipe(concat(of(1))); // $ExpectType Observable<number>
});

it('should support two arguments', () => {
  const o = of(1, 2, 3).pipe(concat(of(1), of(2))); // $ExpectType Observable<number>
});

it('should support three arguments', () => {
  const o = of(1, 2, 3).pipe(concat(of(1), of(2), of(3))); // $ExpectType Observable<number>
});

it('should support four arguments', () => {
  const o = of(1, 2, 3).pipe(concat(of(1), of(2), of(3), of(4))); // $ExpectType Observable<number>
});

it('should support five arguments', () => {
  const o = of(1, 2, 3).pipe(concat(of(1), of(2), of(3), of(4), of(5))); // $ExpectType Observable<number>
});

it('should support six arguments', () => {
  const o = of(1, 2, 3).pipe(concat(of(1), of(2), of(3), of(4), of(5), of(6))); // $ExpectType Observable<number>
});

it('should support six or more arguments', () => {
  const o = of(1, 2, 3).pipe(concat(of(1), of(2), of(3), of(4), of(5), of(6), of(7), of(8), of(9))); // $ExpectType Observable<number>
});

it('should support a scheduler as last parameter', () => {
  const o = of(1, 2, 3).pipe(concat(of(4), of(5), of(6), asyncScheduler)); // $ExpectType Observable<number>
});

it('should support promises', () => {
  const o = of(1, 2, 3).pipe(concat(Promise.resolve(4))); // $ExpectType Observable<number>
});

it('should support arrays', () => {
  const o = of(1, 2, 3).pipe(concat([4, 5])); // $ExpectType Observable<number>
});

it('should support iterables', () => {
  const o = of(1, 2, 3).pipe(concat('foo')); // $ExpectType Observable<string | number>
});

it('should infer correctly with multiple types', () => {
  const o = of(1, 2, 3).pipe(concat(of('foo'), Promise.resolve<number[]>([1]), of(6))); // $ExpectType Observable<string | number | number[]>
});

it('should enforce types', () => {
  const o = of(1, 2, 3).pipe(concat(5)); // $ExpectError
  const p = of(1, 2, 3).pipe(concat(of(5), 6)); // $ExpectError
});
