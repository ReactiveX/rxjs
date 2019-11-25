import { of, animationFrameScheduler, queueScheduler, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';
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

it('should infer never with 0 params', () => {
  expectType<Observable<never>>(of());
});

it('forced generic should not cause an issue', () => {
  const x: any = null;
  expectType<Observable<string>>(of<string>());
  expectType<Observable<string>>(of<string>(x));
});

it('should infer correctly with 1 param', () => {
  expectType<Observable<A>>(of(new A()));
});

it('should infer correctly with mixed type of 2 params', () => {
  expectType<Observable<A | B>>(of(a, b));
});

it('should infer correctly with mixed type of 3 params', () => {
  expectType<Observable<A | B | C>>(of(a, b, c));
});

it('should infer correctly with mixed type of 4 params', () => {
  expectType<Observable<A | B | C | D>>(of(a, b, c, d));
});

it('should infer correctly with mixed type of 5 params', () => {
  expectType<Observable<A | B | C | D | E>>(of(a, b, c, d, e));
});

it('should infer correctly with mixed type of 6 params', () => {
  expectType<Observable<A | B | C | D | E | F>>(of(a, b, c, d, e, f));
});

it('should infer correctly with mixed type of 7 params', () => {
  expectType<Observable<A | B | C | D | E | F | G>>(of(a, b, c, d, e, f, g));
});

it('should infer correctly with mixed type of 8 params', () => {
  expectType<Observable<A | B | C | D | E | F | G | H>>(of(a, b, c, d, e, f, g, h));
});

it('should infer correctly with mixed type of 9 params', () => {
  expectType<Observable<A | B | C | D | E | F | G | H | I>>(of(a, b, c, d, e, f, g, h, i));
});

it('should infer correctly with mono type of more than 9 params', () => {
  expectType<Observable<number>>(of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10));
});

it('should support mixed type of 9 params', () => {
  expectType<Observable<A | B | C | D | E | F | G | H | I | J>>(of(a, b, c, d, e, f, g, h, i, j));
});

it('should support mixed type of 13 params', () => {
  expectType<Observable<string | number | boolean | number[] | A | B | C | D | E | F | G | H | I | J>>(of(a, b, c, d, e, f, g, h, i, j, '', true, 123, [1, 2, 3]));
});

it('should support a rest of params', () => {
  const arr = [a, b, c, d, e, f, g, h, i, j];
  expectType<Observable<A | B | C | D | E | F | G | H | I | J>>(of(...arr));

  const arr2 = ['test', 123, a];
  expectType<Observable<string | number | A>>(of(...arr2));

  expectType<Observable<string | number | boolean | A | B | C>>(of(b, ...arr2, c, true));
});

it('should support scheduler', () => {
  expectType<Observable<A>>(of(a, animationFrameScheduler));
});

it('should infer correctly with array', () => {
  expectType<Observable<(A | B | C)[]>>(of([a, b, c]));
});


// SchedulerLike inclusions (remove in v8)
it('should infer never with 0 params', () => {
  expectType<Observable<never>>(of(queueScheduler));
});

it('should infer correctly with 1 param', () => {
  expectType<Observable<A>>(of(new A(), queueScheduler));
});

it('should infer correctly with mixed type of 2 params', () => {
  expectType<Observable<A | B>>(of(a, b, queueScheduler));
});

it('should infer correctly with mixed type of 3 params', () => {
  expectType<Observable<A | B | C>>(of(a, b, c, queueScheduler));
});

it('should infer correctly with mixed type of 4 params', () => {
  expectType<Observable<A | B | C | D>>(of(a, b, c, d, queueScheduler));
});

it('should infer correctly with mixed type of 5 params', () => {
  expectType<Observable<A | B | C | D | E>>(of(a, b, c, d, e, queueScheduler));
});

it('should infer correctly with mixed type of 6 params', () => {
  expectType<Observable<A | B | C | D | E | F>>(of(a, b, c, d, e, f, queueScheduler));
});

it('should infer correctly with mixed type of 7 params', () => {
  expectType<Observable<A | B | C | D | E | F | G>>(of(a, b, c, d, e, f, g, queueScheduler));
});

it('should infer correctly with mixed type of 8 params', () => {
  expectType<Observable<A | B | C | D | E | F | G | H>>(of(a, b, c, d, e, f, g, h, queueScheduler));
});

it('should infer correctly with mixed type of 9 params', () => {
  expectType<Observable<A | B | C | D | E | F | G | H | I>>(of(a, b, c, d, e, f, g, h, i, queueScheduler));
});

it('should deprecate correctly', () => {
  of(queueScheduler); // $ExpectDeprecation
  of(a, queueScheduler); // $ExpectDeprecation
  of(a, b, queueScheduler); // $ExpectDeprecation
  of(a, b, c, queueScheduler); // $ExpectDeprecation
  of(a, b, c, d, queueScheduler); // $ExpectDeprecation
  of(a, b, c, d, e, queueScheduler); // $ExpectDeprecation
  of(a, b, c, d, e, f, queueScheduler); // $ExpectDeprecation
  of(a, b, c, d, e, f, g, queueScheduler); // $ExpectDeprecation
  of(a, b, c, d, e, f, g, h, queueScheduler); // $ExpectDeprecation
  of(a, b, c, d, e, f, g, h, i, queueScheduler); // $ExpectDeprecation  
  of<A>(); // $ExpectDeprecation
  of(); // $ExpectNoDeprecation
  of(a); // $ExpectNoDeprecation
  of(a, b); // $ExpectNoDeprecation
  of(a, b, c); // $ExpectNoDeprecation
  of(a, b, c, d); // $ExpectNoDeprecation
});
