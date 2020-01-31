import { race, of } from 'rxjs';
import { a$, b, b$, c, c$, d$, e$, f$ } from '../helpers';

describe('race(a, b, c)', () => {
  it('should support N arguments of different types', () => {
    const o1 = race(a$); // $ExpectType Observable<A>
    const o2 = race(a$, b$); // $ExpectType Observable<A | B>
    const o3 = race(a$, b$, c$); // $ExpectType Observable<A | B | C>
    const o4 = race(a$, b$, c$, d$); // $ExpectType Observable<A | B | C | D>
    const o5 = race(a$, b$, c$, d$, e$); // $ExpectType Observable<A | B | C | D | E>
    const o6 = race(a$, b$, c$, d$, e$, f$); // $ExpectType Observable<A | B | C | D | E | F>
  });
});

describe('race([a, b, c])', () => {
  it('should support N arguments of different types', () => {
    const o1 = race([a$]); // $ExpectType Observable<A>
    const o2 = race([a$, b$]); // $ExpectType Observable<A | B>
    const o3 = race([a$, b$, c$]); // $ExpectType Observable<A | B | C>
    const o4 = race([a$, b$, c$, d$]); // $ExpectType Observable<A | B | C | D>
    const o5 = race([a$, b$, c$, d$, e$]); // $ExpectType Observable<A | B | C | D | E>
    const o6 = race([a$, b$, c$, d$, e$, f$]); // $ExpectType Observable<A | B | C | D | E | F>
  });
});

it('should race observable inputs', () => {
  const o = race(a$, Promise.resolve(b), [c]); // $ExpectType Observable<A | B | C>
});

it('should race an array observable inputs', () => {
  const o = race([a$, Promise.resolve(b), [c]]); // $ExpectType Observable<A | B | C>
});
