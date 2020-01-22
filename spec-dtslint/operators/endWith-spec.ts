import { of, asyncScheduler } from 'rxjs';
import { endWith } from 'rxjs/operators';
import { a, b, c, d, e, f, g, h } from '../helpers';

it('should support a scheduler', () => {
  const r = of(a).pipe(endWith(asyncScheduler)); // $ExpectType Observable<A>
});

it('should infer type for N values', () => {
  const r0 = of(a).pipe(endWith()); // $ExpectType Observable<A>
  const r1 = of(a).pipe(endWith(b)); // $ExpectType Observable<A | B>
  const r2 = of(a).pipe(endWith(b, c)); // $ExpectType Observable<A | B | C>
  const r3 = of(a).pipe(endWith(b, c, d)); // $ExpectType Observable<A | B | C | D>
  const r4 = of(a).pipe(endWith(b, c, d, e)); // $ExpectType Observable<A | B | C | D | E>
  const r5 = of(a).pipe(endWith(b, c, d, e, f)); // $ExpectType Observable<A | B | C | D | E | F>
  const r6 = of(a).pipe(endWith(b, c, d, e, f, g)); // $ExpectType Observable<A | B | C | D | E | F | G>
  const r7 = of(a).pipe(endWith(b, c, d, e, f, g, h)); // $ExpectType Observable<A | B | C | D | E | F | G | H>
});
