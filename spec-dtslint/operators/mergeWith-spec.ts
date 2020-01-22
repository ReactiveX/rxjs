import { mergeWith } from 'rxjs/operators';
import { a$, b$, c$, d$, e$, f$, g$, h$} from '../helpers';

it('should accept N args', () => {
  const r0 = a$.pipe(mergeWith()); // $ExpectType Observable<A>
  const r1 = a$.pipe(mergeWith(b$)); // $ExpectType Observable<A | B>
  const r2 = a$.pipe(mergeWith(b$, c$)); // $ExpectType Observable<A | B | C>
  const r3 = a$.pipe(mergeWith(b$, c$, d$)); // $ExpectType Observable<A | B | C | D>
  const r4 = a$.pipe(mergeWith(b$, c$, d$, e$)); // $ExpectType Observable<A | B | C | D | E>
  const r5 = a$.pipe(mergeWith(b$, c$, d$, e$, f$)); // $ExpectType Observable<A | B | C | D | E | F>
  const r6 = a$.pipe(mergeWith(b$, c$, d$, e$, f$, g$)); // $ExpectType Observable<A | B | C | D | E | F | G>
  const r7 = a$.pipe(mergeWith(b$, c$, d$, e$, f$, g$, h$)); // $ExpectType Observable<A | B | C | D | E | F | G | H>
});