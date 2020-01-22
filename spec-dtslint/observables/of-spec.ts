import { of, animationFrameScheduler, queueScheduler } from 'rxjs';
import { A, a, b, c, d, e, f, g, h, i, j } from '../helpers';

it('should infer never with 0 params', () => {
  const res = of(); // $ExpectType Observable<never>
});

it('forced generic should not cause an issue', () => {
  const x: any = null;
  const res = of<string>(); // $ExpectType Observable<string>
  const res2 = of<string>(x); // $ExpectType Observable<string>
});

it('should infer correctly with 1 param', () => {
  const res = of(a); // $ExpectType Observable<A>
});

it('should infer correctly with mixed type of 2 params', () => {
  const res = of(a, b); // $ExpectType Observable<A | B>
});

it('should infer correctly with mixed type of 3 params', () => {
  const res = of(a, b, c); // $ExpectType Observable<A | B | C>
});

it('should infer correctly with mixed type of 4 params', () => {
  const res = of(a, b, c, d); // $ExpectType Observable<A | B | C | D>
});

it('should infer correctly with mixed type of 5 params', () => {
  const res = of(a, b, c, d, e); // $ExpectType Observable<A | B | C | D | E>
});

it('should infer correctly with mixed type of 6 params', () => {
  const res = of(a, b, c, d, e, f); // $ExpectType Observable<A | B | C | D | E | F>
});

it('should infer correctly with mixed type of 7 params', () => {
  const res = of(a, b, c, d, e, f, g); // $ExpectType Observable<A | B | C | D | E | F | G>
});

it('should infer correctly with mixed type of 8 params', () => {
  const res = of(a, b, c, d, e, f, g, h); // $ExpectType Observable<A | B | C | D | E | F | G | H>
});

it('should infer correctly with mixed type of 9 params', () => {
  const res = of(a, b, c, d, e, f, g, h, i); // $ExpectType Observable<A | B | C | D | E | F | G | H | I>
});

it('should infer correctly with mono type of more than 9 params', () => {
  const res = of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10); // $ExpectType Observable<number>
});

it('should support mixed type of 9 params', () => {
  const res = of(a, b, c, d, e, f, g, h, i, j); // $ExpectType Observable<A | B | C | D | E | F | G | H | I | J>
});

it('should support mixed type of 13 params', () => {
  const res = of(a, b, c, d, e, f, g, h, i, j, '', true, 123, 10n); // $ExpectType Observable<string | number | bigint | boolean | A | B | C | D | E | F | G | H | I | J>
});

it('should support a rest of params', () => {
  const arr = [a, b, c, d, e, f, g, h, i, j];
  const res = of(...arr); // $ExpectType Observable<A | B | C | D | E | F | G | H | I | J>

  const arr2 = ['test', 123, a];
  const res2 = of(...arr2); // $ExpectType Observable<string | number | A>

  const res3 = of(b, ...arr2, c, true); // $ExpectType Observable<string | number | boolean | A | B | C>
});

it('should support scheduler', () => {
  const res = of(a, animationFrameScheduler); // $ExpectType Observable<A>
});

it('should infer correctly with array', () => {
  const res = of([a, b, c]); // $ExpectType Observable<(A | B | C)[]>
});


// SchedulerLike inclusions (remove in v8)
it('should infer never with 0 params', () => {
  const res = of(queueScheduler); // $ExpectType Observable<never>
});

it('should infer correctly with 1 param', () => {
  const res = of(a, queueScheduler); // $ExpectType Observable<A>
});

it('should infer correctly with mixed type of 2 params', () => {
  const res = of(a, b, queueScheduler); // $ExpectType Observable<A | B>
});

it('should infer correctly with mixed type of 3 params', () => {
  const res = of(a, b, c, queueScheduler); // $ExpectType Observable<A | B | C>
});

it('should infer correctly with mixed type of 4 params', () => {
  const res = of(a, b, c, d, queueScheduler); // $ExpectType Observable<A | B | C | D>
});

it('should infer correctly with mixed type of 5 params', () => {
  const res = of(a, b, c, d, e, queueScheduler); // $ExpectType Observable<A | B | C | D | E>
});

it('should infer correctly with mixed type of 6 params', () => {
  const res = of(a, b, c, d, e, f, queueScheduler); // $ExpectType Observable<A | B | C | D | E | F>
});

it('should infer correctly with mixed type of 7 params', () => {
  const res = of(a, b, c, d, e, f, g, queueScheduler); // $ExpectType Observable<A | B | C | D | E | F | G>
});

it('should infer correctly with mixed type of 8 params', () => {
  const res = of(a, b, c, d, e, f, g, h, queueScheduler); // $ExpectType Observable<A | B | C | D | E | F | G | H>
});

it('should infer correctly with mixed type of 9 params', () => {
  const res = of(a, b, c, d, e, f, g, h, i, queueScheduler); // $ExpectType Observable<A | B | C | D | E | F | G | H | I>
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
