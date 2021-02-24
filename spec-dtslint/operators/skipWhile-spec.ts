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

it('should handle Boolean constructor properly', () => {
  // this one is a bit odd, but probably okay.
  const a = of(null, undefined, 0 as const, -0 as const, '' as const, 0n as const, false as const).pipe(skipWhile(Boolean)); // $ExpectType Observable<false | "" | 0 | 0n | null | undefined>
  const b = of(null, 0 as const, -0 as const, '' as const, 0n as const, false as const).pipe(skipWhile(Boolean)); // $ExpectType Observable<false | "" | 0 | 0n | null>
  const c = of(1, 2, 3, '' as const, 0n as const, false as const, 4).pipe(skipWhile(Boolean)) // $ExpectType Observable<number | false | "" | 0n>
  const d = of(true as const, 123 as const, 'HI' as const, {}, []).pipe(skipWhile(Boolean)); // $ExpectType Observable<never>
});

it('should handle predicates that always return true properly', () => {
  const a = of(1, 2, 3, 4).pipe(skipWhile(() => true as const)); // $ExpectType Observable<never>
});