import { Observable, of } from 'rxjs';
import { map, splitBy } from 'rxjs/operators';

it('should support a predicate', () => {
  const o = of(1, 2, 3).pipe(splitBy((value) => value === 3)); // $ExpectType Observable<[Observable<number>, Observable<number>]>
});

it('should support a user-defined type guard as predicate', () => {
  const o = of(1, 'a', []).pipe(splitBy((value): value is number => typeof value === 'number')); // $ExpectType Observable<[Observable<number>, Observable<string | never[]>]>
});

it('should enforce types', () => {
  const o = of(1, 2, 3).pipe(splitBy()); // $ExpectError
});

it('should enforce predicate types', () => {
  const o = of(1, 2, 3).pipe(splitBy((value) => value === '3')); // $ExpectError
});

it('should enforce user-defined type guard types', () => {
  const o = of(1, 2, 3).pipe(splitBy((value): value is string => value === 'string')); // $ExpectError
});

it('should support Boolean as a predicate', () => {
  const o = of(1, 2, 3).pipe(splitBy(Boolean)); // $ExpectType Observable<[Observable<number>, Observable<never>]>
  const p = of(1, null, undefined).pipe(splitBy(Boolean)); // $ExpectType Observable<[Observable<number>, Observable<null | undefined>]>
  const q = of(null, undefined).pipe(splitBy(Boolean)); // $ExpectType Observable<[Observable<never>, Observable<null | undefined>]>
  const r = of(true).pipe(splitBy(Boolean)); // $ExpectType Observable<[Observable<true>, Observable<false>]>
  const s = of(false as const).pipe(splitBy(Boolean)); // $ExpectType Observable<[Observable<never>, Observable<false>]>
  const t = of(0 as const, -0 as const, 1 as const).pipe(splitBy(Boolean)); // $ExpectType Observable<[Observable<1>, Observable<0>]>
  const u = of(0 as const, -0 as const).pipe(splitBy(Boolean)); // $ExpectType Observable<[Observable<never>, Observable<0>]>
  const v = of('' as const, "foo" as const, "bar" as const).pipe(splitBy(Boolean)); // $ExpectType Observable<[Observable<"foo" | "bar">, Observable<"">]>
  const w = of('' as const).pipe(splitBy(Boolean)); // $ExpectType Observable<[Observable<never>, Observable<"">]>
  // Intentionally weird looking test... `false` is `boolean`, which is `true | false`.
  const x = of(false, false, false, false).pipe(splitBy(Boolean)); // $ExpectType Observable<[Observable<true>, Observable<false>]>
});

// FIXME this one is wrong, the type should be Observable<[Observable<string>, Observable<string | null>]>
it('should support inference from a return type with Boolean as a predicate', () => {
  interface I {
    a: string | null;
  }

  const i$: Observable<I> = of();
  const s$ = i$.pipe(map(i => i.a), splitBy(Boolean)); // $ExpectType Observable<[Observable<string>, Observable<null>]>
});

it('should support inference from a generic return type of the predicate', () => {
  function isDefined<T>() {
    return (value: T | undefined | null): value is T => {
      return value !== undefined && value !== null;
    };
  }

  const o$ = of(1, null, { foo: 'bar' }, true, undefined, 'Nick Cage').pipe(splitBy(isDefined())); // $ExpectType Observable<[Observable<string | number | boolean | { foo: string; }>, Observable<null | undefined>]>
});

it('should support inference from a predicate that returns any', () => {
  function isTruthy(value: number): any {
    return !!value;
  }

  const o$ = of(1).pipe(splitBy(isTruthy)); // $ExpectType Observable<[Observable<number>, Observable<number>]>
});
