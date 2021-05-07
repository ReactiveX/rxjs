import { of } from 'rxjs';
import { find } from 'rxjs/operators';

it('should support a user-defined type guard', () => {
  const o = of('foo').pipe(find((s): s is 'foo' => true)); // $ExpectType Observable<"foo" | undefined>
});

it('should support a user-defined type guard that takes an index', () => {
  const o = of('foo').pipe(find((s, index): s is 'foo' => true)); // $ExpectType Observable<"foo" | undefined>
});

it('should support a user-defined type guard that takes an index and the source', () => {
  const o = of('foo').pipe(find((s, index, source): s is 'foo' => true)); // $ExpectType Observable<"foo" | undefined>
});

it('should support a predicate', () => {
  const o = of('foo').pipe(find(s => true)); // $ExpectType Observable<string | undefined>
});

it('should support a predicate that takes an index', () => {
  const o = of('foo').pipe(find((s, index) => true)); // $ExpectType Observable<string | undefined>
});

it('should support a predicate that takes an index and the source', () => {
  const o = of('foo').pipe(find((s, index, source) => true)); // $ExpectType Observable<string | undefined>
});

it('should support Boolean properly', () => {
  const o1 = of('' as const).pipe(find(Boolean)); // $ExpectType Observable<never>
  const o2 = of('' as const, 'hi' as const).pipe(find(Boolean)); // $ExpectType Observable<"hi">
  const o3 = of('' as const, 0 as const, 'test' as const, 'what' as const).pipe(find(Boolean)); // $ExpectType Observable<"test" | "what">
  const o5 = of(false as const, null, undefined, '' as const, 0 as const, 0 as const).pipe(find(Boolean)); // $ExpectType Observable<never>
  // Intentionally weird looking: Because `Observable<boolean>` is `Observable<true | false>` and `true` is the truthy bit.
  const o4 = of(false, false, false, false).pipe(find(Boolean)); // $ExpectType Observable<true>
});

it('should support this', () => {
  const thisArg = { wanted: 5 };
  const a = of(1, 2, 3).pipe(find(function (val) {
    const wanted = this.wanted; // $ExpectType number
    return val < wanted;
  }, thisArg));
});

it('should deprecate thisArg usage', () => {
  const a = of(1, 2, 3).pipe(find(Boolean)); // $ExpectNoDeprecation
  const b = of(1, 2, 3).pipe(find(Boolean, {})); // $ExpectDeprecation
  const c = of(1, 2, 3).pipe(find((value) => Boolean(value))); // $ExpectNoDeprecation
  const d = of(1, 2, 3).pipe(find((value) => Boolean(value), {})); // $ExpectDeprecation
});