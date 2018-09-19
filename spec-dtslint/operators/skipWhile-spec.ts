import { of } from 'rxjs';
import { skipWhile } from 'rxjs/operators';

it('should support a predicate', () => {
  const o = of('foo', 'bar', 'baz').pipe(skipWhile(value => value === 'bar')); // $ExpectType Observable<string>
});

it('should support a predicate with an index', () => {
  const o = of('foo', 'bar', 'baz').pipe(skipWhile((value, index) => index < 3)); // $ExpectType Observable<string>
});

it('should enforce types', () => {
  const o = of('foo', 'bar', 'baz').pipe(skipWhile()); // $ExpectError
});

it('should enforce predicate types', () => {
  const o = of('foo', 'bar', 'baz').pipe(skipWhile(value => value < 3)); // $ExpectError
  const p = of('foo', 'bar', 'baz').pipe(skipWhile((value, index) => index < '3')); // $ExpectError
});

it('should enforce predicate return type', () => {
  const o = of('foo', 'bar', 'baz').pipe(skipWhile(value => value)); // $ExpectError
});
