import { of, asyncScheduler } from 'rxjs';
import { endWith } from 'rxjs/operators';
import { a, b, c, d, e, f, g, h } from '../helpers';

it('should support a scheduler', () => {
  const r = of(a).pipe(endWith(asyncScheduler)); // $ExpectType Observable<A>
});

it('should infer type for 1 parameter', () => {
  const r = of(a).pipe(endWith(b)); // $ExpectType Observable<A | B>
});

it('should infer type for 2 parameter', () => {
  const r = of(a).pipe(endWith(b, c)); // $ExpectType Observable<A | B | C>
});

it('should infer type for 3 parameter', () => {
  const r = of(a).pipe(endWith(b, c, d)); // $ExpectType Observable<A | B | C | D>
});

it('should infer type for 4 parameter', () => {
  const r = of(a).pipe(endWith(b, c, d, e)); // $ExpectType Observable<A | B | C | D | E>
});

it('should infer type for 5 parameter', () => {
  const r = of(a).pipe(endWith(b, c, d, e, f)); // $ExpectType Observable<A | B | C | D | E | F>
});

it('should infer type for 6 parameter', () => {
  const r = of(a).pipe(endWith(b, c, d, e, f, g)); // $ExpectType Observable<A | B | C | D | E | F | G>
});

it('should infer type for rest parameters', () => {
  const r = of(a).pipe(endWith(b, c, d, e, f, g, h)); // $ExpectType Observable<A | B | C | D | E | F | G | H>
});

it('should accept empty parameter', () => {
  const r = of(a).pipe(endWith()); // $ExpectType Observable<A>
});
