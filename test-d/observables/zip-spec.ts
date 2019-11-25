import { Observable, of, zip, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';

it('should support observables', () => {
  expectType<Observable<number>>(of(1));
  expectType<Observable<string>>(of('foo'));
  expectType<Observable<boolean>>(of(true));
  expectType<Observable<[number, string, boolean]>>(zip(a, b, c));
});

it('should support mixed observables and promises', () => {
  expectType<Promise<number>>(Promise.resolve(1));
  expectType<Observable<string>>(of('foo'));
  expectType<Observable<boolean>>(of(true));
  expectType<Observable<string[]>>(of(['bar']));
  expectType<Observable<[number, string, boolean, string[]]>>(zip(a, b, c, d));
});

it('should support arrays of promises', () => {
  expectType<Promise<number>[]>([Promise.resolve(1)]);
  expectType<Observable<number[]>>(zip(a));
  expectType<Observable<number[]>>(zip(...a));
});

it('should support arrays of observables', () => {
  expectType<Observable<number>[]>([of(1)]);
  expectType<Observable<number[]>>(zip(a));
  expectType<Observable<number[]>>(zip(...a));
});

it('should return Array<T> when given a single promise', () => {
  expectType<Promise<number>>(Promise.resolve(1));
  expectType<Observable<number[]>>(zip(a));
});

it('should return Array<T> when given a single observable', () => {
  expectType<Observable<number>>(of(1));
  expectType<Observable<number[]>>(zip(a));
});

it('should support union types', () => {
  const u = Math.random() > 0.5 ? of(123) : of('abc');
  expectType<Observable<[string | number, string | number, string | number]>>(zip(u, u, u));
});

it('should support different union types', () => {
  const u = Math.random() > 0.5 ? of(123) : of('abc');
  const u2 = Math.random() > 0.5 ? of(true) : of([1, 2, 3]);
  expectType<Observable<[string | number, boolean | number[]]>>(zip(u, u2));
});
