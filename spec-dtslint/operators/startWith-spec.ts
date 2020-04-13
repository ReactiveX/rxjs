import { of, asyncScheduler  } from 'rxjs';
import { startWith } from 'rxjs/operators';
import { A, B, a, b, c, d, e, f, g, h } from '../helpers';

it('should infer correctly with N values', () => {
  const r0 = of(a).pipe(startWith()); // $ExpectType Observable<A>
  const r1 = of(a).pipe(startWith(b)); // $ExpectType Observable<A | B>
  const r2 = of(a).pipe(startWith(b, c)); // $ExpectType Observable<A | B | C>
  const r3 = of(a).pipe(startWith(b, c, d)); // $ExpectType Observable<A | B | C | D>
  const r4 = of(a).pipe(startWith(b, c, d, e)); // $ExpectType Observable<A | B | C | D | E>
  const r5 = of(a).pipe(startWith(b, c, d, e, f)); // $ExpectType Observable<A | B | C | D | E | F>
  const r6 = of(a).pipe(startWith(b, c, d, e, f, g)); // $ExpectType Observable<A | B | C | D | E | F | G>
  const r7 = of(a).pipe(startWith(b, c, d, e, f, g, h)); // $ExpectType Observable<A | B | C | D | E | F | G | H>
});

it('should infer correctly with a scheduler', () => {
  const r = of(a).pipe(startWith(asyncScheduler)); // $ExpectType Observable<A>
  const r1 = of(a).pipe(startWith(b, asyncScheduler)); // $ExpectType Observable<A | B>
  const r2 = of(a).pipe(startWith(b, c, asyncScheduler)); // $ExpectType Observable<A | B | C>
  const r3 = of(a).pipe(startWith(b, c, d, asyncScheduler)); // $ExpectType Observable<A | B | C | D>
  const r4 = of(a).pipe(startWith(b, c, d, e, asyncScheduler)); // $ExpectType Observable<A | B | C | D | E>
  const r5 = of(a).pipe(startWith(b, c, d, e, f, asyncScheduler)); // $ExpectType Observable<A | B | C | D | E | F>
  const r6 = of(a).pipe(startWith(b, c, d, e, f, g, asyncScheduler)); // $ExpectType Observable<A | B | C | D | E | F | G>
  });

it('should infer correctly with a single specified type', () => {
  const r0 = of(a).pipe(startWith<A>(a)); // $ExpectType Observable<A>
  const r1 = of(a).pipe(startWith<A|B>(b)); // $ExpectType Observable<A | B>
  const r2 = of(a).pipe(startWith<A|B>(a)); // $ExpectType Observable<A | B>
});
