import { of, concat, asyncScheduler, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';

it('should accept 1 param', () => {
  expectType<Observable<number>>(concat(of(1)));
});

it('should accept 2 params', () => {
  expectType<Observable<number>>(concat(of(1), of(2)));
});

it('should accept 3 params', () => {
  expectType<Observable<number>>(concat(of(1), of(2), of(3)));
});

it('should accept 4 params', () => {
  expectType<Observable<number>>(concat(of(1), of(2), of(3), of(4)));
});

it('should accept 5 params', () => {
  expectType<Observable<number>>(concat(of(1), of(2), of(3), of(4), of(5)));
});

it('should accept 6 params', () => {
  expectType<Observable<number>>(concat(of(1), of(2), of(3), of(4), of(5), of(6)));
});

it('should accept more than 6 params', () => {
  expectType<Observable<number>>(concat(of(1), of(2), of(3), of(4), of(5), of(6), of(7), of(8), of(9)));
});

it('should return Observable<unknown> for more than 6 different types of params', () => {
  expectType<Observable<string | number | boolean | number[]>>(concat(of(1), of('a'), of(2), of(true), of(3), of([1, 2, 3]), of(4)));
});

it('should accept scheduler after params', () => {
  expectType<Observable<number>>(concat(of(4), of(5), of(6), asyncScheduler));
});

it('should accept promises', () => {
  expectType<Observable<number>>(concat(Promise.resolve(4)));
});

it('should accept arrays', () => {
  expectType<Observable<number>>(concat([4, 5]));
});

it('should accept iterables', () => {
  expectType<Observable<string | number>>(concat([1], 'foo'));
});

it('should infer correctly with multiple types', () => {
  expectType<Observable<string | number | number[]>>(concat(of('foo'), Promise.resolve<number[]>([1]), of(6)));
});

it('should enforce types', () => {
  expectError(concat(5));
  expectError(concat(of(5), 6));
});

it('should support union types', () => {
  const u = Math.random() > 0.5 ? of(123) : of('abc');
  expectType<Observable<string | number>>(concat(u, u, u));
});

it('should support different union types', () => {
  const u1 = Math.random() > 0.5 ? of(123) : of('abc');
  const u2 = Math.random() > 0.5 ? of(true) : of([1, 2, 3]);
  expectType<Observable<string | number | boolean | number[]>>(concat(u1, u2));
});
