import { of, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';
import { pluck } from 'rxjs/operators';

it('should infer correctly', () => {
  expectType<Observable<string>>(of({ name: 'abc' }).pipe(pluck('name')));
});

it('should support nested object of 2 layer depth', () => {
  expectType<Observable<string>>(of({ a: { name: 'abc' } }).pipe(pluck('a', 'name')));
});

it('should support nested object of 3 layer depth', () => {
  expectType<Observable<string>>(of({ a: { b: { name: 'abc' } } }).pipe(pluck('a', 'b', 'name')));
});

it('should support nested object of 4 layer depth', () => {
  expectType<Observable<string>>(of({ a: { b: { c: { name: 'abc' } } } }).pipe(pluck('a', 'b', 'c', 'name')));
});

it('should support nested object of 5 layer depth', () => {
  expectType<Observable<string>>(of({ a: { b: { c: { d: { name: 'abc' } } } } }).pipe(pluck('a', 'b', 'c', 'd', 'name')));
});

it('should support nested object of 6 layer depth', () => {
  expectType<Observable<string>>(of({ a: { b: { c: { d: { e: { name: 'abc' } } } } } }).pipe(pluck('a', 'b', 'c', 'd', 'e', 'name')));
});

it('should support nested object of more than 6 layer depth', () => {
  expectType<Observable<unknown>>(of({ a: { b: { c: { d: { e: { f: { name: 'abc' } } } } } } }).pipe(pluck('a', 'b', 'c', 'd', 'e', 'f', 'name')));
});

it('should accept existing keys only', () => {
  expectType<Observable<unknown>>(of({ name: 'abc' }).pipe(pluck('xyz')));
});

it('should not accept empty parameter', () => {
  expectType<Observable<unknown>>(of({ name: 'abc' }).pipe(pluck()));
});

it('should accept string only', () => {
  expectError(of({ name: 'abc' }).pipe(pluck(1)));
});

it('should accept a spread of arguments', () => {
  const obj = {
    foo: {
      bar: {
        baz: 123
      }
    }
  };

  const path = ['foo', 'bar', 'baz'];
  expectType<Observable<unknown>>(of(obj).pipe(pluck(...path)));

  const path2 = ['bar', 'baz'];
  expectType<Observable<unknown>>(of(obj).pipe(pluck('foo', ...path2)));
});
