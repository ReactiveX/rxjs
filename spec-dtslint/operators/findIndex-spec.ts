import { of, Observable } from 'rxjs';
import { findIndex } from 'rxjs/operators';

it('should infer correctly', () => {
  const o = of(1, 2, 3).pipe(findIndex(n => n === 3)); // $ExpectType Observable<number>
});

it('should support a predicate that takes an index ', () => {
  const o = of(1, 2, 3).pipe(findIndex((n, index) => index === 3)); // $ExpectType Observable<number>
});

it('should support a predicate that takes a source ', () => {
  const o = of(1, 2, 3).pipe(findIndex((n, index, source) => n === 3)); // $ExpectType Observable<number>
});

it('should support an argument ', () => {
  const o = of(1, 2, 3).pipe(findIndex((n) => n === 3, 'foo')); // $ExpectType Observable<number>
});

it('should enforce types', () => {
  const o = of(1, 2, 3).pipe(findIndex()); // $ExpectError
});

it('should enforce predicate types', () => {
  const o = of(1, 2, 3).pipe(findIndex((n: string) => n === 3)); // $ExpectError
  const p = of(1, 2, 3).pipe(findIndex((n, index: string) => n === 3)); // $ExpectError
  const q = of(1, 2, 3).pipe(findIndex((n, index, source: Observable<string>) => n === 3)); // $ExpectError
});

it('should enforce predicate return type', () => {
  const o = of(1, 2, 3).pipe(findIndex(n => n)); // $ExpectError
});
