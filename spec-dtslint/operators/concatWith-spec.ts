import { of } from 'rxjs';
import { concatWith } from 'rxjs/operators';
import { a$, b$, c$, d$, e$ } from 'helpers';

it('should support rest params', () => {
  const arr = [b$, c$];
  const o = a$.pipe(concatWith(...arr)); // $ExpectType Observable<A | B | C>
  const o2 = a$.pipe(concatWith(d$, ...arr, e$)); // $ExpectType Observable<A | B | C | D | E>
});

it('should infer correctly', () => {
  const o = of(1, 2, 3).pipe(concatWith()); // $ExpectType Observable<number>
});

it('should support one argument', () => {
  const o = of(1, 2, 3).pipe(concatWith(of(1))); // $ExpectType Observable<number>
});

it('should support two arguments', () => {
  const o = of(1, 2, 3).pipe(concatWith(of(1), of(2))); // $ExpectType Observable<number>
});

it('should support three arguments', () => {
  const o = of(1, 2, 3).pipe(concatWith(of(1), of(2), of(3))); // $ExpectType Observable<number>
});

it('should support four arguments', () => {
  const o = of(1, 2, 3).pipe(concatWith(of(1), of(2), of(3), of(4))); // $ExpectType Observable<number>
});

it('should support five arguments', () => {
  const o = of(1, 2, 3).pipe(concatWith(of(1), of(2), of(3), of(4), of(5))); // $ExpectType Observable<number>
});

it('should support six arguments', () => {
  const o = of(1, 2, 3).pipe(concatWith(of(1), of(2), of(3), of(4), of(5), of(6))); // $ExpectType Observable<number>
});

it('should support six or more arguments', () => {
  const o = of(1, 2, 3).pipe(concatWith(of(1), of(2), of(3), of(4), of(5), of(6), of(7), of(8), of(9))); // $ExpectType Observable<number>
});

it('should support promises', () => {
  const o = of(1, 2, 3).pipe(concatWith(Promise.resolve(4))); // $ExpectType Observable<number>
});

it('should support arrays', () => {
  const o = of(1, 2, 3).pipe(concatWith([4, 5])); // $ExpectType Observable<number>
});

it('should support iterables', () => {
  const o = of(1, 2, 3).pipe(concatWith('foo')); // $ExpectType Observable<string | number>
});

it('should infer correctly with multiple types', () => {
  const o = of(1, 2, 3).pipe(concatWith(of('foo'), Promise.resolve([1]), of(6))); // $ExpectType Observable<string | number | number[]>
});

it('should enforce types', () => {
  const o = of(1, 2, 3).pipe(concatWith(5)); // $ExpectError
  const p = of(1, 2, 3).pipe(concatWith(of(5), 6)); // $ExpectError
});
