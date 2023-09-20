import { rx, map, of, toArray, filter } from 'rxjs';
import { A, B, C, D, E, F, G, H, I, J } from '../helpers'

it('should infer conversions from ObservableInputs', () => {
  const o1 = rx([1, 2, 3]); // $ExpectType Observable<number>
  const o2 = rx(new Set<number>()); // $ExpectType Observable<number>
  const o3 = rx(new Map<string, number>()); // $ExpectType Observable<[string, number]>
  const o4 = rx(of(1, 2, 3)); // $ExpectType Observable<number>
  const o5 = rx(Promise.resolve(1)); // $ExpectType Observable<number>
  const o6 = rx(Promise.resolve([1, 2, 3])); // $ExpectType Observable<number[]>

  function* test() {
    yield 1;
    yield 2;
    yield 3;
  }

  const o7 = rx(test()); // $ExpectType Observable<1 | 2 | 3>
  
  async function* test2() {
    yield 1;
    yield 2;
    yield 3;
  }

  const o8 = rx(test2()); // $ExpectType Observable<1 | 2 | 3>
  const o9 = rx({}); // $ExpectError
});

it('should compose with pipeable functions, passing an Observable to the first of those functions', () => {
  const o1 = rx([1, 2, 3], map(n => n + 1)); // $ExpectType Observable<number>
  const o2 = rx([1, 2, 3], map(n => n + 1), filter(n => n < 3)); // $ExpectType Observable<number>
  const o3 = rx([1, 2, 3], map(n => n + 1), filter(n => n < 3), toArray()); // $ExpectType Observable<number[]>
  const o4 = rx([1, 2, 3], map(n => n + 1), filter(n => n < 3), toArray(), map(n => n.length)); // $ExpectType Observable<number>

  // Even with unary functions that are not RxJS operators
  const o5 = rx([1, 2, 3], map(n => n + 1), toArray(), source => Object.keys(source), keys => keys.length); // $ExpectType number
  
  // Maybe as a means of subscription
  const o6 = rx([1, 2, 3], map(n => n + 1), toArray(), source => source.subscribe()); // $ExpectType Subscription
})


it('should handle a large number of unary functions appropriately', () => {
  const r0 = rx([1, 2, 3]); // $ExpectType Observable<number>
  const r1 = rx([1, 2, 3], () => new A()); // $ExpectType A
  const r2 = rx([1, 2, 3], () => new A(), () => new B()); // $ExpectType B
  const r3 = rx([1, 2, 3], () => new A(), () => new B(), () => new C()); // $ExpectType C
  const r4 = rx([1, 2, 3], () => new A(), () => new B(), () => new C(), () => new D()); // $ExpectType D
  const r5 = rx([1, 2, 3], () => new A(), () => new B(), () => new C(), () => new D(), () => new E()); // $ExpectType E
  const r6 = rx([1, 2, 3], () => new A(), () => new B(), () => new C(), () => new D(), () => new E(), () => new F()); // $ExpectType F
  const r7 = rx([1, 2, 3], () => new A(), () => new B(), () => new C(), () => new D(), () => new E(), () => new F(), () => new G()); // $ExpectType G
  const r8 = rx([1, 2, 3], () => new A(), () => new B(), () => new C(), () => new D(), () => new E(), () => new F(), () => new G(), () => new H()); // $ExpectType H
  const r9 = rx([1, 2, 3], () => new A(), () => new B(), () => new C(), () => new D(), () => new E(), () => new F(), () => new G(), () => new H(), () => new I()); // $ExpectType unknown
  const r10 = rx([1, 2, 3], () => new A(), () => new B(), () => new C(), () => new D(), () => new E(), () => new F(), () => new G(), () => new H(), () => new I(), () => new J()); // $ExpectType unknown
})