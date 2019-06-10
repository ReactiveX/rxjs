import { of, partition } from 'rxjs';

it('should infer correctly', () => {
  const o = partition(of('a', 'b', 'c'), (value, index) => true); // $ExpectType [Observable<string>, Observable<string>]
  const p = partition(of('a', 'b', 'c'), () => true); // $ExpectType [Observable<string>, Observable<string>]
});

it('should accept a thisArg parameter', () => {
  const o = partition(of('a', 'b', 'c'), () => true, 5); // $ExpectType [Observable<string>, Observable<string>]
});

it('should enforce predicate', () => {
  const o = partition(of('a', 'b', 'c')); // $ExpectError
});

it('should enforce predicate types', () => {
  const o = partition(of('a', 'b', 'c'), 'nope'); // $ExpectError
  const p = partition(of('a', 'b', 'c'), (value: number) => true); // $ExpectError
  const q = partition(of('a', 'b', 'c'), (value, index: string) => true); // $ExpectError
});
