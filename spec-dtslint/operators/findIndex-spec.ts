import { of, Observable } from 'rxjs';
import { findIndex } from 'rxjs/operators';

it('should infer correctly', () => {
  const o = of('foo', 'bar', 'baz').pipe(findIndex(p => p === 'foo')); // $ExpectType Observable<number>
});

it('should support a predicate that takes an index ', () => {
  const o = of('foo', 'bar', 'baz').pipe(findIndex((p, index) => index === 3)); // $ExpectType Observable<number>
});

it('should support a predicate that takes a source ', () => {
  const o = of('foo', 'bar', 'baz').pipe(findIndex((p, index, source) => p === 'foo')); // $ExpectType Observable<number>
});

it('should support an argument ', () => {
  const o = of('foo', 'bar', 'baz').pipe(findIndex(p => p === 'foo', 123)); // $ExpectType Observable<number>
});

it('should enforce types', () => {
  const o = of('foo', 'bar', 'baz').pipe(findIndex()); // $ExpectError
});

it('should enforce predicate types', () => {
  const o = of('foo', 'bar', 'baz').pipe(findIndex((p: number) => p === 3)); // $ExpectError
  const p = of('foo', 'bar', 'baz').pipe(findIndex((p, index: string) => p === 3)); // $ExpectError
  const q = of('foo', 'bar', 'baz').pipe(findIndex((p, index, source: Observable<number>) => p === 3)); // $ExpectError
});

it('should enforce predicate return type', () => {
  const o = of('foo', 'bar', 'baz').pipe(findIndex(p => p)); // $ExpectError
});
