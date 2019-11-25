import { of, combineLatest, asyncScheduler, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';

class A { a = 0; }
class B { b = 0; }
class C { c = 0; }
class D { d = 0; }
class E { e = 0; }
class F { f = 0; }
class G { g = 0; }

const a = of(new A());
const b = of(new B());
const c = of(new C());
const d = of(new D());
const e = of(new E());
const f = of(new F());
const g = of(new G());

it('should accept 1 param', () => {
  expectType<Observable<[A]>>(combineLatest(a));
});

it('should accept 2 params', () => {
  expectType<Observable<[A, B]>>(combineLatest(a, b));
});

it('should accept 3 params', () => {
  expectType<Observable<[A, B, C]>>(combineLatest(a, b, c));
});

it('should accept 4 params', () => {
  expectType<Observable<[A, B, C, D]>>(combineLatest(a, b, c, d));
});

it('should accept 5 params', () => {
  expectType<Observable<[A, B, C, D, E]>>(combineLatest(a, b, c, d, e));
});

it('should accept 6 params', () => {
  expectType<Observable<[A, B, C, D, E, F]>>(combineLatest(a, b, c, d, e, f));
});

it('should result in Observable<unknown> for 7 or more params', () => {
  expectType<Observable<unknown>>(combineLatest(a, b, c, d, e, f, g));
});

it('should accept union types', () => {
  const u1: typeof a | typeof b = Math.random() > 0.5 ? a : b;
  const u2: typeof c | typeof d = Math.random() > 0.5 ? c : d;
  expectType<Observable<[A | B, C | D]>>(combineLatest(u1, u2));
});

it('should accept 1 param and a result selector', () => {
  expectType<Observable<A>>(combineLatest(a, () => new A()));
});

it('should accept 2 params and a result selector', () => {
  expectType<Observable<A>>(combineLatest(a, b, () => new A()));
});

it('should accept 3 params and a result selector', () => {
  expectType<Observable<A>>(combineLatest(a, b, c, () => new A()));
});

it('should accept 4 params and a result selector', () => {
  expectType<Observable<A>>(combineLatest(a, b, c, d, () => new A()));
});

it('should accept 5 params and a result selector', () => {
  expectType<Observable<A>>(combineLatest(a, b, c, d, e, () => new A()));
});

it('should accept 6 params and a result selector', () => {
  expectType<Observable<A>>(combineLatest(a, b, c, d, e, f, () => new A()));
});

it('should accept 7 or more params and a result selector', () => {
  expectType<Observable<A>>(combineLatest(a, b, c, d, e, f, g, g, g, () => new A()));
});

it('should accept 1 param', () => {
  expectType<Observable<[A]>>(combineLatest([a]));
});

it('should accept 2 params', () => {
  expectType<Observable<[A, B]>>(combineLatest([a, b]));
});

it('should accept 3 params', () => {
  expectType<Observable<[A, B, C]>>(combineLatest([a, b, c]));
});

it('should accept 4 params', () => {
  expectType<Observable<[A, B, C, D]>>(combineLatest([a, b, c, d]));
});

it('should accept 5 params', () => {
  expectType<Observable<[A, B, C, D, E]>>(combineLatest([a, b, c, d, e]));
});

it('should accept 6 params', () => {
  expectType<Observable<[A, B, C, D, E, F]>>(combineLatest([a, b, c, d, e, f]));
});

it('should have basic support for 7 or more params', () => {
  expectType<Observable<(A | B | C | D | E | F | G)[]>>(combineLatest([a, b, c, d, e, f, g]));
});

it('should handle an array of Observables', () => {
  expectType<Observable<A[]>>(combineLatest([a, a, a, a, a, a, a, a, a, a, a]));
});

it('should accept 1 param and a result selector', () => {
  expectType<Observable<A>>(combineLatest([a], (a: A) => new A()));
});

it('should accept 2 params and a result selector', () => {
  expectType<Observable<A>>(combineLatest([a, b], (a: A, b: B) => new A()));
});

it('should accept 3 params and a result selector', () => {
  expectType<Observable<A>>(combineLatest([a, b, c], (a: A, b: B, c: C) => new A()));
});

it('should accept 4 params and a result selector', () => {
  expectType<Observable<A>>(combineLatest([a, b, c, d], (a: A, b: B, c: C, d: D) => new A()));
});

it('should accept 5 params and a result selector', () => {
  expectType<Observable<A>>(combineLatest([a, b, c, d, e], (a: A, b: B, c: C, d: D, e: E) => new A()));
});

it('should accept 6 params and a result selector', () => {
  expectType<Observable<A>>(combineLatest([a, b, c, d, e, f], (a: A, b: B, c: C, d: D, e: E, f: F) => new A()));
});

it('should accept 7 or more params and a result selector', () => {
  expectType<Observable<A>>(combineLatest([a, b, c, d, e, f, g, g, g], (a: any, b: any, c: any, d: any, e: any, f: any, g1: any, g2: any, g3: any) => new A()));
});
