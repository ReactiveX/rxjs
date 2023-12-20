import { of, from, partition } from 'rxjs';

it('should infer correctly', () => {
  const o = partition(of('a', 'b', 'c'), (value, index) => true); // $ExpectType [Observable<string>, Observable<string>]
  const p = partition(of('a', 'b', 'c'), () => true); // $ExpectType [Observable<string>, Observable<string>]
});

it('should support a user-defined type guard', () => {
  const o = partition(of(1, 2, 3), (value: number): value is 1 => value === 1); // $ExpectType [Observable<1>, Observable<number>]
});

it('should support exclusion based on the user-defined type guard', () => {
  const o = partition(from([1, 2] as const), (value: number): value is 1 => value === 1); // $ExpectType [Observable<1>, Observable<2>]
});

it('should enforce predicate', () => {
  const o = partition(of('a', 'b', 'c')); // $ExpectError
});

it('should enforce predicate types', () => {
  const o = partition(of('a', 'b', 'c'), 'nope'); // $ExpectError
  const p = partition(of('a', 'b', 'c'), (value: number) => true); // $ExpectError
  const q = partition(of('a', 'b', 'c'), (value, index: string) => true); // $ExpectError
});

it('should support this with type guard', () => {
  const thisArg = { limit: 2 };
  const a = partition(of(1, 2, 3), function (val): val is 1 { // $ExpectType [Observable<1>, Observable<number>]
    const limit = this.limit; // $ExpectType number
    return val < limit;
  }, thisArg);
});

it('should support this with exclusion based on the user-defined type guard', () => {
  const thisArg = { limit: 2 };
  const a = partition(from([1, 2] as const), function (val): val is 1 { // $ExpectType [Observable<1>, Observable<2>]
    const limit = this.limit; // $ExpectType number
    return val < limit;
  }, thisArg);
});

it('should support this with predicate', () => {
  const thisArg = { limit: 2 };
  const a = partition(of(1, 2, 3), function (val) { // $ExpectType [Observable<number>, Observable<number>]
    const limit = this.limit; // $ExpectType number
    return val < limit;
  }, thisArg);
});

it('should deprecate thisArg usage', () => {
  const a = partition(of(1, 2, 3), Boolean); // $ExpectNoDeprecation
  const b = partition(of(1, 2, 3), Boolean, {}); // $ExpectDeprecation
  const c = partition(of(1, 2, 3), (value) => Boolean(value)); // $ExpectNoDeprecation
  const d = partition(of(1, 2, 3), (value) => Boolean(value), {}); // $ExpectDeprecation
});