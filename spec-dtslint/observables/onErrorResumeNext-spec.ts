/** @prettier */
import { onErrorResumeNext } from 'rxjs';
import { a$, b$, c$, d$, e$, f$, g$, h$, i$, j$ } from '../helpers';

it('should infer correctly', () => {
  const o1 = onErrorResumeNext(); // $ExpectType Observable<never>
  const o2 = onErrorResumeNext(a$); // $ExpectType Observable<A>
  const o3 = onErrorResumeNext(a$, b$); // $ExpectType Observable<A | B>
  const o4 = onErrorResumeNext(a$, b$, c$); // $ExpectType Observable<A | B | C>
  const o5 = onErrorResumeNext(a$, b$, c$, d$); // $ExpectType Observable<A | B | C | D>
  const o6 = onErrorResumeNext(a$, b$, c$, d$, e$); // $ExpectType Observable<A | B | C | D | E>
  const o7 = onErrorResumeNext(a$, b$, c$, d$, e$, f$); // $ExpectType Observable<A | B | C | D | E | F>
  const o8 = onErrorResumeNext(a$, b$, c$, d$, e$, f$, g$); // $ExpectType Observable<A | B | C | D | E | F | G>
  const o9 = onErrorResumeNext(a$, b$, c$, d$, e$, f$, g$, h$); // $ExpectType Observable<A | B | C | D | E | F | G | H>
  const o10 = onErrorResumeNext(a$, b$, c$, d$, e$, f$, g$, h$, i$); // $ExpectType Observable<A | B | C | D | E | F | G | H | I>
  const o11 = onErrorResumeNext(a$, b$, c$, d$, e$, f$, g$, h$, i$, j$); // $ExpectType Observable<A | B | C | D | E | F | G | H | I | J>
});

it('should handle non-observable inputs appropriately', () => {
  const o1 = onErrorResumeNext({ lol: 'test' }); // $ExpectError
  const o2 = onErrorResumeNext(a$, { haha: 'no' }); // $ExpectError
});

it('should handle observable inputs okay', () => {
  const o1 = onErrorResumeNext([1, 2, 3, 'test'], Promise.resolve(true)); // $ExpectType Observable<string | number | boolean>
  const o2 = onErrorResumeNext( // $ExpecType Observable<string>
    (function* () {
      return 'test';
    })()
  );
});
