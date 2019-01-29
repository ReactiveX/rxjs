import { of, animationFrameScheduler } from 'rxjs';
import { A, B, C, D, E, F, G, H, I, J } from '../helpers';

const a = new A();
const b = new B();
const c = new C();
const d = new D();
const e = new E();
const f = new F();
const g = new G();
const h = new H();
const i = new I();
const j = new J();

it('should infer correctly with 1 param', () => {
  const res = of(new A()); // $ExpectType Observable<A>
});

it('should infer correcly with mixed type of 2 params', () => {
  const res = of(a, b); // $ExpectType Observable<A | B>
});

it('should infer correcly with mixed type of 3 params', () => {
  const res = of(a, b, c); // $ExpectType Observable<A | B | C>
});

it('should infer correcly with mixed type of 4 params', () => {
  const res = of(a, b, c, d); // $ExpectType Observable<A | B | C | D>
});

it('should infer correcly with mixed type of 5 params', () => {
  const res = of(a, b, c, d, e); // $ExpectType Observable<A | B | C | D | E>
});

it('should infer correcly with mixed type of 6 params', () => {
  const res = of(a, b, c, d, e, f); // $ExpectType Observable<A | B | C | D | E | F>
});

it('should infer correcly with mixed type of 7 params', () => {
  const res = of(a, b, c, d, e, f, g); // $ExpectType Observable<A | B | C | D | E | F | G>
});

it('should infer correcly with mixed type of 8 params', () => {
  const res = of(a, b, c, d, e, f, g, h); // $ExpectType Observable<A | B | C | D | E | F | G | H>
});

it('should infer correcly with mixed type of 9 params', () => {
  const res = of(a, b, c, d, e, f, g, h, i); // $ExpectType Observable<A | B | C | D | E | F | G | H | I>
});

it('should infer correcly with mono type of more than 9 params', () => {
  const res = of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10); // $ExpectType Observable<number>
});

/*
TODO: The below test throws error where it should infer correctly with empty interface({})
shoudl be able to comment back in when https://github.com/ReactiveX/rxjs/issues/4502 is resolved
it('should not support mixed type of more than 9 params', () => {
  const res = of(a, b, c, d, e, f, g, h, i, j); // $TODO: Shoule ExpectType Observable<{}>
});
 */

it('should support scheduler', () => {
  const res = of(a, animationFrameScheduler); // $ExpectType Observable<A>
});

it('should infer correctly with array', () => {
  const res = of([a, b, c]); // $ExpectType Observable<(A | B | C)[]>
});
