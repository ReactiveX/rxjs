import { of } from 'rxjs';
import { last } from 'rxjs/operators';

const isFooBar = (value: string): value is 'foo' | 'bar' => /^(foo|bar)$/.test(value);

it('should support an undefined predicate with no default', () => {
  const o = of('foo').pipe(last(undefined)); // $ExpectType Observable<string>
});

it('should support an undefined predicate with T default', () => {
  const o = of('foo').pipe(last(undefined, 'bar')); // $ExpectType Observable<string>
});

it('should support an undefined predicate with non-T default', () => {
  const o = of('foo').pipe(last(undefined, false)); // $ExpectType Observable<string | boolean>
});

it('should support a null predicate with no default', () => {
  const o = of('foo').pipe(last(null)); // $ExpectType Observable<string>
});

it('should support a null predicate with T default', () => {
  const o = of('foo').pipe(last(null, 'bar')); // $ExpectType Observable<string>
});

it('should support a null predicate with non-T default', () => {
  const o = of('foo').pipe(last(null, false)); // $ExpectType Observable<string | boolean>
});

it('should support a user-defined type guard with no default', () => {
  const o = of('foo').pipe(last(isFooBar)); // $ExpectType Observable<"foo" | "bar">
});

it('should support a user-defined type guard with a default', () => {
  const o = of('foo').pipe(last(isFooBar, 'bar')); // $ExpectType Observable<"foo" | "bar">
});

it('should widen a user-defined type guard with a non-T default', () => {
  const o = of('foo').pipe(last(isFooBar, false)); // $ExpectType Observable<string | boolean>
});

it('should support a predicate with no default', () => {
  const o = of('foo').pipe(last(x => !!x)); // $ExpectType Observable<string>
});

it('should support a predicate with T default', () => {
  const o = of('foo').pipe(last(x => !!x, 'bar')); // $ExpectType Observable<string>
});

it('should support a predicate with non-T default', () => {
  const o = of('foo').pipe(last(x => !!x, false)); // $ExpectType Observable<string | boolean>
});
