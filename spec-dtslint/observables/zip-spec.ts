import { Observable, of, zip } from 'rxjs';

it('should support observables', () => {
  const a = of(1); // $ExpectType Observable<number>
  const b = of('foo'); // $ExpectType Observable<string>
  const c = of(true); // $ExpectType Observable<boolean>
  const o1 = zip(a, b, c); // $ExpectType Observable<[number, string, boolean]>
});

it('should support mixed observables and promises', () => {
  const a = Promise.resolve(1); // $ExpectType Promise<number>
  const b = of('foo'); // $ExpectType Observable<string>
  const c = of(true); // $ExpectType Observable<boolean>
  const d = of(['bar']); // $ExpectType Observable<string[]>
  const o1 = zip(a, b, c, d); // $ExpectType Observable<[number, string, boolean, string[]]>
});

it('should support arrays of promises', () => {
  const a = [Promise.resolve(1)]; // $ExpectType Promise<number>[]
  const o1 = zip(a); // $ExpectType Observable<number[]>
  const o2 = zip(...a); // $ExpectType Observable<number[]>
});

it('should support arrays of observables', () => {
  const a = [of(1)]; // $ExpectType Observable<number>[]
  const o1 = zip(a); // $ExpectType Observable<number[]>
  const o2 = zip(...a); // $ExpectType Observable<number[]>
});

it('should return Array<T> when given a single promise', () => {
  const a = Promise.resolve(1); // $ExpectType Promise<number>
  const o1 = zip(a); // $ExpectType Observable<number[]>
});

it('should return Array<T> when given a single observable', () => {
  const a = of(1); // $ExpectType Observable<number>
  const o1 = zip(a); // $ExpectType Observable<number[]>
});

it('should support union types', () => {
  const u = Math.random() > 0.5 ? of(123) : of('abc');
  const o = zip(u, u, u); // $ExpectType Observable<[string | number, string | number, string | number]>
});

it('should support different union types', () => {
  const u = Math.random() > 0.5 ? of(123) : of('abc');
  const u2 = Math.random() > 0.5 ? of(true) : of([1, 2, 3]);
  const o = zip(u, u2); // $ExpectType Observable<[string | number, boolean | number[]]>
});
