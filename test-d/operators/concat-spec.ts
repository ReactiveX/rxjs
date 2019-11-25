import { of, asyncScheduler, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';
import { concat } from 'rxjs/operators';

it('should infer correctly', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(concat()));
});

it('should support a scheduler', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(concat(asyncScheduler)));
});

it('should support one argument', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(concat(of(1))));
});

it('should support two arguments', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(concat(of(1), of(2))));
});

it('should support three arguments', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(concat(of(1), of(2), of(3))));
});

it('should support four arguments', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(concat(of(1), of(2), of(3), of(4))));
});

it('should support five arguments', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(concat(of(1), of(2), of(3), of(4), of(5))));
});

it('should support six arguments', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(concat(of(1), of(2), of(3), of(4), of(5), of(6))));
});

it('should support six or more arguments', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(concat(of(1), of(2), of(3), of(4), of(5), of(6), of(7), of(8), of(9))));
});

it('should support a scheduler as last parameter', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(concat(of(4), of(5), of(6), asyncScheduler)));
});

it('should support promises', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(concat(Promise.resolve(4))));
});

it('should support arrays', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(concat([4, 5])));
});

it('should support iterables', () => {
  expectType<Observable<string | number>>(of(1, 2, 3).pipe(concat('foo')));
});

it('should infer correctly with multiple types', () => {
  expectType<Observable<string | number | number[]>>(of(1, 2, 3).pipe(concat(of('foo'), Promise.resolve<number[]>([1]), of(6))));
});

it('should enforce types', () => {
  expectError(of(1, 2, 3).pipe(concat(5)));
  expectError(of(1, 2, 3).pipe(concat(of(5), 6)));
});
