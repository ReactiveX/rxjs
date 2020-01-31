import { raceWith } from 'rxjs/operators';
import { a$, b, b$, c, c$, d$, e$, f$ } from '../helpers';

describe('raceWith', () => {
  it('should support N arguments of different types', () => {
    const o1 = a$.pipe(raceWith(b$)); // $ExpectType Observable<A | B>
    const o2 = a$.pipe(raceWith(b$, c$)); // $ExpectType Observable<A | B | C>
    const o3 = a$.pipe(raceWith(b$, c$, d$)); // $ExpectType Observable<A | B | C | D>
    const o4 = a$.pipe(raceWith(b$, c$, d$, e$)); // $ExpectType Observable<A | B | C | D | E>
    const o5 = a$.pipe(raceWith(b$, c$, d$, e$, f$)); // $ExpectType Observable<A | B | C | D | E | F>
  });
});

it('should race observable inputs', () => {
  const o = a$.pipe(raceWith(Promise.resolve(b), [c])); // $ExpectType Observable<A | B | C>
});
