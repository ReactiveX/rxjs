import { of, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';
import { skipWhile } from 'rxjs/operators';

it('should support a predicate', () => {
  expectType<Observable<string>>(of('foo', 'bar', 'baz').pipe(skipWhile(value => value === 'bar')));
});

it('should support a predicate with an index', () => {
  expectType<Observable<string>>(of('foo', 'bar', 'baz').pipe(skipWhile((value, index) => index < 3)));
});

it('should enforce types', () => {
  expectError(of('foo', 'bar', 'baz').pipe(skipWhile()));
});

it('should enforce predicate types', () => {
  expectError(of('foo', 'bar', 'baz').pipe(skipWhile(value => value < 3)));
  expectError(of('foo', 'bar', 'baz').pipe(skipWhile((value, index) => index < '3')));
});

it('should enforce predicate return type', () => {
  expectError(of('foo', 'bar', 'baz').pipe(skipWhile(value => value)));
});
