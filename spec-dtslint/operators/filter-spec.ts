import { Observable, of } from 'rxjs';
import { filter, map } from 'rxjs/operators';

it('should support a predicate', () => {
  const o = of(1, 2, 3).pipe(filter(value => value < 3)); // $ExpectType Observable<number>
});

it('should support a predicate with an index', () => {
  const o = of(1, 2, 3).pipe(filter((value, index) => index < 3)); // $ExpectType Observable<number>
});

it('should support a predicate and an argument', () => {
  const o = of(1, 2, 3).pipe(filter(value => value < 3, 'bonjour')); // $ExpectType Observable<number>
});

it('should support a user-defined type guard', () => {
  const o = of(1, 2, 3).pipe(filter((value: number): value is 1 => value < 3)); // $ExpectType Observable<1>
});

it('should support a user-defined type guard with an index', () => {
  const o = of(1, 2, 3).pipe(filter((value: number, index): value is 1 => index < 3)); // $ExpectType Observable<1>
});

it('should support a user-defined type guard and an argument', () => {
  const o = of(1, 2, 3).pipe(filter((value: number): value is 1 => value < 3, 'hola')); // $ExpectType Observable<1>
});

it('should enforce types', () => {
  const o = of(1, 2, 3).pipe(filter()); // $ExpectError
});

it('should enforce predicate types', () => {
  const o = of(1, 2, 3).pipe(filter(value => value < '3')); // $ExpectError
  const p = of(1, 2, 3).pipe(filter((value, index) => index < '3')); // $ExpectError
});

it('should enforce user-defined type guard types', () => {
  const o = of(1, 2, 3).pipe(filter((value: string): value is '1' => value < '3')); // $ExpectError
  const p = of(1, 2, 3).pipe(filter((value: number, index): value is 1 => index < '3')); // $ExpectError
});

it('should support Boolean as a predicate', () => {
  const o = of(1, 2, 3).pipe(filter(Boolean)); // $ExpectType Observable<number>
  const p = of(1, null, undefined).pipe(filter(Boolean)); // $ExpectType Observable<number>
  const q = of(null, undefined).pipe(filter(Boolean)); // $ExpectType Observable<never>
  const r = of(true).pipe(filter(Boolean)); // $ExpectType Observable<true>
  const s = of(false as const).pipe(filter(Boolean)); // $ExpectType Observable<never>
  const t = of(0 as const, -0 as const, 1 as const).pipe(filter(Boolean)); // $ExpectType Observable<1>
  const u = of(0 as const, -0 as const).pipe(filter(Boolean)); // $ExpectType Observable<never>
  const v = of('' as const, "foo" as const, "bar" as const).pipe(filter(Boolean)); // $ExpectType Observable<"foo" | "bar">
  const w = of('' as const).pipe(filter(Boolean)); // $ExpectType Observable<never>
  // Intentionally weird looking test... `false` is `boolean`, which is `true | false`.
  const x = of(false, false, false, false).pipe(filter(Boolean)); // $ExpectType Observable<true>
});

// I've not been able to effect a failing dtslint test for this situation and a
// conventional test won't fail because the TypeScript configuration isn't
// sufficiently strict:
// https://github.com/ReactiveX/rxjs/issues/4959#issuecomment-520629091
it('should support inference from a return type with Boolean as a predicate', () => {
  interface I {
    a: string | null;
  }

  const i$: Observable<I> = of();
  const s$: Observable<string> = i$.pipe(map(i => i.a), filter(Boolean)); // $ExpectType Observable<string>
});

it('should support inference from a generic return type of the predicate', () => {
  function isDefined<T>() {
    return (value: T|undefined|null): value is T => {
      return value !== undefined && value !== null;
    };
  }

  const o$ = of(1, null, {foo: 'bar'}, true, undefined, 'Nick Cage').pipe(filter(isDefined())); // $ExpectType Observable<string | number | boolean | { foo: string; }>
});

it('should support inference from a predicate that returns any', () => {
  function isTruthy(value: number): any {
    return !!value;
  }

  const o$ = of(1).pipe(filter(isTruthy)); // $ExpectType Observable<number>
});

it('should support this', () => {
  const thisArg = { limit: 5 };
  const a = of(1, 2, 3).pipe(filter(function (val) {
    const limit = this.limit; // $ExpectType number
    return val < limit;
  }, thisArg));
});

it('should deprecate thisArg usage', () => {
  const a = of(1, 2, 3).pipe(filter(Boolean)); // $ExpectNoDeprecation
  const b = of(1, 2, 3).pipe(filter(Boolean, {})); // $ExpectDeprecation
  const c = of(1, 2, 3).pipe(filter((value) => Boolean(value))); // $ExpectNoDeprecation
  const d = of(1, 2, 3).pipe(filter((value) => Boolean(value), {})); // $ExpectDeprecation
});