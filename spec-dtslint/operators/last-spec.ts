import { of } from 'rxjs';
import { last } from 'rxjs/operators';

const isFooBar = (value: string): value is 'foo' | 'bar' => /^(foo|bar)$/.test(value);

it('should support an undefined predicate with no default', () => {
  const o = of('foo').pipe(last(undefined)); // $ExpectType Observable<string>
});

it('should support an undefined predicate with a T default', () => {
  const o = of('foo').pipe(last(undefined, 'bar')); // $ExpectType Observable<string>
});

it('should support an undefined predicate with a non-T default', () => {
  const o = of('foo').pipe(last(undefined, false)); // $ExpectType Observable<string | boolean>
});

it('should default D to T with an undfined predicate', () => {
  const o = of('foo').pipe(last<string>(undefined)); // $Observable<string>
});

it('should support a null predicate with no default', () => {
  const o = of('foo').pipe(last(null)); // $ExpectType Observable<string>
});

it('should support a null predicate with a T default', () => {
  const o = of('foo').pipe(last(null, 'bar')); // $ExpectType Observable<string>
});

it('should support a null predicate with a non-T default', () => {
  const o = of('foo').pipe(last(null, false)); // $ExpectType Observable<string | boolean>
});

it('should default D to T with a null predicate', () => {
  const o = of('foo').pipe(last<string>(null)); // $Observable<string>
});

it('should support a user-defined type guard with no default', () => {
  const o = of('foo').pipe(last(isFooBar)); // $ExpectType Observable<"foo" | "bar">
});

it('should support a user-defined type guard with an S default', () => {
  const o = of('foo').pipe(last(isFooBar, 'bar')); // $ExpectType Observable<"foo" | "bar">
});

it('should widen a user-defined type guard with a non-S default', () => {
  const o = of('foo').pipe(last(isFooBar, false)); // $ExpectType Observable<string | boolean>
});

it('should support a predicate with no default', () => {
  const o = of('foo').pipe(last(x => !!x)); // $ExpectType Observable<string>
});

it('should support a predicate with a T default', () => {
  const o = of('foo').pipe(last(x => !!x, 'bar')); // $ExpectType Observable<string>
});

it('should support a predicate with a non-T default', () => {
  const o = of('foo').pipe(last(x => !!x, false)); // $ExpectType Observable<string | boolean>
});

it('should default D to T with a predicate', () => {
  const o = of('foo').pipe(last<string>(x => !!x)); // $ExpectType Observable<string>
});

it('should handle predicates that always return false properly', () => {
  const a = of('foo', 'bar').pipe(last(() => false as const)); // $ExpectType Observable<string>
  const b = of('foo', 'bar').pipe(last(() => false as const, 1337 as const)); // $ExpectType Observable<string | 1337>
});

it('should handle Boolean constructor properly', () => {
  const a = of(0 as const, -0 as const, null, undefined, false as const, '' as const, 0n as const).pipe(last(Boolean)); // $ExpectType Observable<never>
  const b = of(0 as const, -0 as const, null, undefined, false as const, '' as const, 0n as const).pipe(last(Boolean, 'test' as const)); // $ExpectType Observable<"test">
  const c = of(0 as const, -0 as const, null, 'hi' as const, undefined, false as const, '' as const, 0n as const).pipe(last(Boolean)); // $ExpectType Observable<"hi">
  const d = of(0 as const, -0 as const, null, 'hi' as const, undefined, false as const, '' as const, 0n as const).pipe(last(Boolean, 'test' as const)); // $ExpectType Observable<"test" | "hi">
});

it('should support inference from a predicate that returns any', () => {
  function isTruthy(value: number): any {
    return !!value;
  }

  const o$ = of(1).pipe(last(isTruthy)); // $ExpectType Observable<number>
});