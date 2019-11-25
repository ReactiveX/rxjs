import { of, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';
import { last } from 'rxjs/operators';

const isFooBar = (value: string): value is 'foo' | 'bar' => /^(foo|bar)$/.test(value);

it('should support an undefined predicate with no default', () => {
  expectType<Observable<string>>(of('foo').pipe(last(undefined)));
});

it('should support an undefined predicate with a T default', () => {
  expectType<Observable<string>>(of('foo').pipe(last(undefined, 'bar')));
});

it('should support an undefined predicate with a non-T default', () => {
  expectType<Observable<string | boolean>>(of('foo').pipe(last(undefined, false)));
});

it('should default D to T with an undfined predicate', () => {
  const o = of('foo').pipe(last<string>(undefined)); // $Observable<string>
});

it('should support a null predicate with no default', () => {
  expectType<Observable<string>>(of('foo').pipe(last(null)));
});

it('should support a null predicate with a T default', () => {
  expectType<Observable<string>>(of('foo').pipe(last(null, 'bar')));
});

it('should support a null predicate with a non-T default', () => {
  expectType<Observable<string | boolean>>(of('foo').pipe(last(null, false)));
});

it('should default D to T with a null predicate', () => {
  const o = of('foo').pipe(last<string>(null)); // $Observable<string>
});

it('should support a user-defined type guard with no default', () => {
  expectType<Observable<"foo" | "bar">>(of('foo').pipe(last(isFooBar)));
});

it('should support a user-defined type guard with an S default', () => {
  expectType<Observable<"foo" | "bar">>(of('foo').pipe(last(isFooBar, 'bar')));
});

it('should widen a user-defined type guard with a non-S default', () => {
  expectType<Observable<string | boolean>>(of('foo').pipe(last(isFooBar, false)));
});

it('should support a predicate with no default', () => {
  expectType<Observable<string>>(of('foo').pipe(last(x => !!x)));
});

it('should support a predicate with a T default', () => {
  expectType<Observable<string>>(of('foo').pipe(last(x => !!x, 'bar')));
});

it('should support a predicate with a non-T default', () => {
  expectType<Observable<string | boolean>>(of('foo').pipe(last(x => !!x, false)));
});

it('should default D to T with a predicate', () => {
  const o = of('foo').pipe(last<string>(x => !!x)); // $Observable<string>
});
