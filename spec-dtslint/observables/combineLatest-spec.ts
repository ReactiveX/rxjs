import { combineLatest } from 'rxjs';
import { a$,  b$,  c$,  d$,  e$,  f$,  g$, A, B, C, D, E, F } from '../helpers';


it('should accept 1 param', () => {
  const o = combineLatest(a$); // $ExpectType Observable<[A]>
});

it('should accept 2 params', () => {
  const o = combineLatest(a$, b$); // $ExpectType Observable<[A, B]>
});

it('should accept 3 params', () => {
  const o = combineLatest(a$, b$, c$); // $ExpectType Observable<[A, B, C]>
});

it('should accept 4 params', () => {
  const o = combineLatest(a$, b$, c$, d$); // $ExpectType Observable<[A, B, C, D]>
});

it('should accept 5 params', () => {
  const o = combineLatest(a$, b$, c$, d$, e$); // $ExpectType Observable<[A, B, C, D, E]>
});

it('should accept 6 params', () => {
  const o = combineLatest(a$, b$, c$, d$, e$, f$); // $ExpectType Observable<[A, B, C, D, E, F]>
});

it('should result in Observable<unknown> for 7 or more params', () => {
  const o = combineLatest(a$, b$, c$, d$, e$, f$, g$); // $ExpectType Observable<[A, B, C, D, E, F, G]>
});

it('should accept union types', () => {
  const u1: typeof a$ | typeof b$ = Math.random() > 0.5 ? a$ : b$;
  const u2: typeof c$ | typeof d$ = Math.random() > 0.5 ? c$ : d$;
  const o = combineLatest(u1, u2); // $ExpectType Observable<[A | B, C | D]>
});

it('should accept 1 param and a result selector', () => {
  const o = combineLatest(a$, (...values) => new A()); // $ExpectType Observable<A>
});

it('should accept 2 params and a result selector', () => {
  const o = combineLatest(a$, b$, (...values) => new A()); // $ExpectType Observable<A>
});

it('should accept 3 params and a result selector', () => {
  const o = combineLatest(a$, b$, c$, (...values) => new A()); // $ExpectType Observable<A>
});

it('should accept 4 params and a result selector', () => {
  const o = combineLatest(a$, b$, c$, d$, (...values) => new A()); // $ExpectType Observable<A>
});

it('should accept 5 params and a result selector', () => {
  const o = combineLatest(a$, b$, c$, d$, e$, (...values) => new A()); // $ExpectType Observable<A>
});

it('should accept 6 params and a result selector', () => {
  const o = combineLatest(a$, b$, c$, d$, e$, f$, (...values) => new A()); // $ExpectType Observable<A>
});

it('should accept 7 or more params and a result selector', () => {
  const o = combineLatest(a$, b$, c$, d$, e$, f$, g$, g$, g$, (...values) => new A()); // $ExpectType Observable<A>
});

it('should accept 1 param', () => {
  const o = combineLatest([a$]); // $ExpectType Observable<[A]>
});

it('should accept 2 params', () => {
  const o = combineLatest([a$, b$]); // $ExpectType Observable<[A, B]>
});

it('should accept 3 params', () => {
  const o = combineLatest([a$, b$, c$]); // $ExpectType Observable<[A, B, C]>
});

it('should accept 4 params', () => {
  const o = combineLatest([a$, b$, c$, d$]); // $ExpectType Observable<[A, B, C, D]>
});

it('should accept 5 params', () => {
  const o = combineLatest([a$, b$, c$, d$, e$]); // $ExpectType Observable<[A, B, C, D, E]>
});

it('should accept 6 params', () => {
  const o = combineLatest([a$, b$, c$, d$, e$, f$]); // $ExpectType Observable<[A, B, C, D, E, F]>
});

it('should have basic support for 7 or more params', () => {
  const o = combineLatest([a$, b$, c$, d$, e$, f$, g$]); // $ExpectType Observable<[A, B, C, D, E, F, G]>
});

it('should have full support for 7 or more params with readonly tuples', () => {
  const o = combineLatest([a$, b$, c$, d$, e$, f$, g$] as const); // $ExpectType Observable<[A, B, C, D, E, F, G]>
});

it('should handle an array of Observables', () => {
  const o = combineLatest([a$, a$, a$, a$, a$, a$, a$, a$, a$, a$, a$]); // $ExpectType Observable<[A, A, A, A, A, A, A, A, A, A, A]>
});

it('should accept 1 param and a result selector', () => {
  const o = combineLatest([a$], (a: A) => new A()); // $ExpectType Observable<A>
});

it('should accept 2 params and a result selector', () => {
  const o = combineLatest([a$, b$], (a: A, b: B) => new A()); // $ExpectType Observable<A>
});

it('should accept 3 params and a result selector', () => {
  const o = combineLatest([a$, b$, c$], (a: A, b: B, c: C) => new A()); // $ExpectType Observable<A>
});

it('should accept 4 params and a result selector', () => {
  const o = combineLatest([a$, b$, c$, d$], (a: A, b: B, c: C, d: D) => new A()); // $ExpectType Observable<A>
});

it('should accept 5 params and a result selector', () => {
  const o = combineLatest([a$, b$, c$, d$, e$], (a: A, b: B, c: C, d: D, e: E) => new A()); // $ExpectType Observable<A>
});

it('should accept 6 params and a result selector', () => {
  const o = combineLatest([a$, b$, c$, d$, e$, f$], (a: A, b: B, c: C, d: D, e: E, f: F) => new A()); // $ExpectType Observable<A>
});

it('should accept 7 or more params and a result selector', () => {
  const o = combineLatest([a$, b$, c$, d$, e$, f$, g$, g$, g$], (a: any, b: any, c: any, d: any, e: any, f: any, g1: any, g2: any, g3: any) => new A()); // $ExpectType Observable<A>
});

describe('combineLatest({})', () => {
  it('should properly type empty objects', () => {
    const res = combineLatest({}); // $ExpectType Observable<never>
  });

  it('should work for the simple case', () => {
    const res = combineLatest({ foo: a$, bar: b$, baz: c$ }); // $ExpectType Observable<{ foo: A; bar: B; baz: C; }>
  });

  it('should not rely upon the excess-properties behavior to identify empty objects', () => {
    const obj = { foo: a$, bar: b$, baz: c$ };
    const res = combineLatest(obj); // $ExpectType Observable<{ foo: A; bar: B; baz: C; }>
  });

  it('should reject non-ObservableInput values', () => {
    const obj = { answer: 42 };
    const res = combineLatest(obj); // $ExpectError
  });
});

it('should take in any and return Observable<unknown> because we do not know if it is an array or object', () => {
  const arg: any = null;
  const res = combineLatest(arg); // $ExpectType Observable<unknown>
});