import { of, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';
import { concatWith } from 'rxjs/operators';
import { a, b$, c$, d$, e$ } from 'helpers';

it('should support rest params', () => {
  const arr = [b$, c$];
  expectType<Observable<A | B | C>>(of(a).pipe(concatWith(...arr)));
  expectType<Observable<A | B | C | D | E>>(of(a).pipe(concatWith(d$, ...arr, e$)));
});

it('should infer correctly', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(concatWith()));
});

it('should support one argument', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(concatWith(of(1))));
});

it('should support two arguments', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(concatWith(of(1), of(2))));
});

it('should support three arguments', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(concatWith(of(1), of(2), of(3))));
});

it('should support four arguments', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(concatWith(of(1), of(2), of(3), of(4))));
});

it('should support five arguments', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(concatWith(of(1), of(2), of(3), of(4), of(5))));
});

it('should support six arguments', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(concatWith(of(1), of(2), of(3), of(4), of(5), of(6))));
});

it('should support six or more arguments', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(concatWith(of(1), of(2), of(3), of(4), of(5), of(6), of(7), of(8), of(9))));
});

it('should support promises', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(concatWith(Promise.resolve(4))));
});

it('should support arrays', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(concatWith([4, 5])));
});

it('should support iterables', () => {
  expectType<Observable<string | number>>(of(1, 2, 3).pipe(concatWith('foo')));
});

it('should infer correctly with multiple types', () => {
  expectType<Observable<string | number | number[]>>(of(1, 2, 3).pipe(concatWith(of('foo'), Promise.resolve([1]), of(6))));
});

it('should enforce types', () => {
  expectError(of(1, 2, 3).pipe(concatWith(5)));
  expectError(of(1, 2, 3).pipe(concatWith(of(5), 6)));
});
