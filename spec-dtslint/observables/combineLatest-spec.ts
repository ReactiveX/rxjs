import { of, combineLatest, asyncScheduler } from 'rxjs';

class A {}
class B {}
class C {}
class D {}
class E {}
class F {}
class G {}

const a = of(new A());
const b = of(new B());
const c = of(new C());
const d = of(new D());
const e = of(new E());
const f = of(new F());
const g = of(new G());

it('should accept 1 param', () => {
  // Since this is an uncommon case, we're just allowing A[]
  const o = combineLatest(a); // $ExpectType Observable<[A]>
});

it('should accept 2 params', () => {
  const o = combineLatest(a, b); // $ExpectType Observable<[A, B]>
});

it('should accept 3 params', () => {
  const o = combineLatest(a, b, c); // $ExpectType Observable<[A, B, C]>
});

it('should accept 4 params', () => {
  const o = combineLatest(a, b, c, d); // $ExpectType Observable<[A, B, C, D]>
});

it('should accept 5 params', () => {
  const o = combineLatest(a, b, c, d, e); // $ExpectType Observable<[A, B, C, D, E]>
});

it('should accept 6 params', () => {
  const o = combineLatest(a, b, c, d, e, f); // $ExpectType Observable<[A, B, C, D, E, F]>
});

it('should result in Observable<any[]> for 7 or more params', () => {
  const o = combineLatest(a, b, c, d, e, f, g); // $ExpectType Observable<any[]>
});

it('should accept union types', () => {
  const u1: typeof a | typeof b = Math.random() > 0.5 ? a : b;
  const u2: typeof c | typeof d = Math.random() > 0.5 ? c : d;
  const o = combineLatest(u1, u2); // $ExpectType Observable<[A | B, C | D]>
});

it('should accept 1 param and a result selector', () => {
  const o = combineLatest(a, () => new A()); // $ExpectType Observable<A>
});

it('should accept 2 params and a result selector', () => {
  const o = combineLatest(a, b, () => new A()); // $ExpectType Observable<A>
});

it('should accept 3 params and a result selector', () => {
  const o = combineLatest(a, b, c, () => new A()); // $ExpectType Observable<A>
});

it('should accept 4 params and a result selector', () => {
  const o = combineLatest(a, b, c, d, () => new A()); // $ExpectType Observable<A>
});

it('should accept 5 params and a result selector', () => {
  const o = combineLatest(a, b, c, d, e, () => new A()); // $ExpectType Observable<A>
});

it('should accept 6 params and a result selector', () => {
  const o = combineLatest(a, b, c, d, e, f, () => new A()); // $ExpectType Observable<A>
});

it('should accept 7 or more params and a result selector', () => {
  const o = combineLatest(a, b, c, d, e, f, g, g, g, () => new A()); // $ExpectType Observable<A>
});
