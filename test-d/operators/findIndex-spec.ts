import { of, Observable, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';
import { findIndex } from 'rxjs/operators';

it('should infer correctly', () => {
  expectType<Observable<number>>(of('foo', 'bar', 'baz').pipe(findIndex(p => p === 'foo')));
});

it('should support a predicate that takes an index ', () => {
  expectType<Observable<number>>(of('foo', 'bar', 'baz').pipe(findIndex((p, index) => index === 3)));
});

it('should support a predicate that takes a source ', () => {
  expectType<Observable<number>>(of('foo', 'bar', 'baz').pipe(findIndex((p, index, source) => p === 'foo')));
});

it('should support an argument ', () => {
  expectType<Observable<number>>(of('foo', 'bar', 'baz').pipe(findIndex(p => p === 'foo', 123)));
});

it('should enforce types', () => {
  expectError(of('foo', 'bar', 'baz').pipe(findIndex()));
});

it('should enforce predicate types', () => {
  expectError(of('foo', 'bar', 'baz').pipe(findIndex((p: number) => p === 3)));
  expectError(of('foo', 'bar', 'baz').pipe(findIndex((p, index: string) => p === 3)));
  expectError(of('foo', 'bar', 'baz').pipe(findIndex((p, index, source: Observable<number>) => p === 3)));
});

it('should enforce predicate return type', () => {
  expectError(of('foo', 'bar', 'baz').pipe(findIndex(p => p)));
});
