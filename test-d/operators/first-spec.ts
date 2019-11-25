import { of, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';
import { first } from 'rxjs/operators';

const isFooBar = (value: string): value is 'foo' | 'bar' => /^(foo|bar)$/.test(value);

it('should support an undefined predicate with no default', () => {
  expectType<Observable<string>>(of('foo').pipe(first(undefined)));
});

it('should support an undefined predicate with a T default', () => {
  expectType<Observable<string>>(of('foo').pipe(first(undefined, 'bar')));
});

it('should support an undefined predicate with a non-T default', () => {
  expectType<Observable<string | boolean>>(of('foo').pipe(first(undefined, false)));
});

it('should default D to T with an undfined predicate', () => {
  const o = of('foo').pipe(first<string>(undefined)); // $Observable<string>
});

it('should support a null predicate with no default', () => {
  expectType<Observable<string>>(of('foo').pipe(first(null)));
});

it('should support a null predicate with a T default', () => {
  expectType<Observable<string>>(of('foo').pipe(first(null, 'bar')));
});

it('should support a null predicate with a non-T default', () => {
  expectType<Observable<string | boolean>>(of('foo').pipe(first(null, false)));
});

it('should default D to T with a null predicate', () => {
  const o = of('foo').pipe(first<string>(null)); // $Observable<string>
});

it('should support a user-defined type guard with no default', () => {
  expectType<Observable<"foo" | "bar">>(of('foo').pipe(first(isFooBar)));
});

it('should support a user-defined type guard with an S default', () => {
  expectType<Observable<"foo" | "bar">>(of('foo').pipe(first(isFooBar, 'bar')));
});

it('should widen a user-defined type guard with a non-S default', () => {
  expectType<Observable<string | boolean>>(of('foo').pipe(first(isFooBar, false)));
});

it('should support a predicate with no default', () => {
  expectType<Observable<string>>(of('foo').pipe(first(x => !!x)));
});

it('should support a predicate with a T default', () => {
  expectType<Observable<string>>(of('foo').pipe(first(x => !!x, 'bar')));
});

it('should support a predicate with a non-T default', () => {
  expectType<Observable<string | boolean>>(of('foo').pipe(first(x => !!x, false)));
});

it('should default D to T with a predicate', () => {
  const o = of('foo').pipe(first<string>(x => !!x)); // $Observable<string>
});
