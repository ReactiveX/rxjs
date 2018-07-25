import { of } from 'rxjs';
import { first } from 'rxjs/operators';

const isFooBar = (value: string): value is 'foo' | 'bar' => /^(foo|bar)$/.test(value);

it('should support an undefined predicate with no default', () => {
  const o = of('foo').pipe(first(undefined)); // $ExpectType Observable<string>
});

it('should support an undefined predicate with T default', () => {
  const o = of('foo').pipe(first(undefined, 'bar')); // $ExpectType Observable<string>
});

it('should support an undefined predicate with non-T default', () => {
  const o = of('foo').pipe(first(undefined, false)); // $ExpectType Observable<string | boolean>
});

it('should support a null predicate with no default', () => {
  const o = of('foo').pipe(first(null)); // $ExpectType Observable<string>
});

it('should support a null predicate with T default', () => {
  const o = of('foo').pipe(first(null, 'bar')); // $ExpectType Observable<string>
});

it('should support a null predicate with non-T default', () => {
  const o = of('foo').pipe(first(null, false)); // $ExpectType Observable<string | boolean>
});

it('should support a user-defined type guard with no default', () => {
  const o = of('foo').pipe(first(isFooBar)); // $ExpectType Observable<"foo" | "bar">
});

it('should support a user-defined type guard with a default', () => {
  const o = of('foo').pipe(first(isFooBar, 'bar')); // $ExpectType Observable<"foo" | "bar">
});

it('should widen a user-defined type guard with a non-T default', () => {
  const o = of('foo').pipe(first(isFooBar, false)); // $ExpectType Observable<string | boolean>
});

it('should support a predicate with no default', () => {
  const o = of('foo').pipe(first(x => !!x)); // $ExpectType Observable<string>
});

it('should support a predicate with T default', () => {
  const o = of('foo').pipe(first(x => !!x, 'bar')); // $ExpectType Observable<string>
});

it('should support a predicate with non-T default', () => {
  const o = of('foo').pipe(first(x => !!x, false)); // $ExpectType Observable<string | boolean>
});
