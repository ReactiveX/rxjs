import { a$, b$, c$, d$, e$, f$, g$, h$, i$, j$ } from 'helpers';
import { asapScheduler, merge } from 'rxjs';

describe('it should infer the result properly', () => {
  const o1 = merge(a$, b$, c$, d$, e$, f$, g$, h$, i$, j$); // $ExpectType Observable<A | B | C | D | E | F | G | H | I | J>
  const o2 = merge(a$, b$, c$, d$, e$, f$, g$, h$, i$); // $ExpectType Observable<A | B | C | D | E | F | G | H | I>
  const o3 = merge(a$, b$, c$, d$, e$, f$, g$, h$); // $ExpectType Observable<A | B | C | D | E | F | G | H>
  const o4 = merge(a$, b$, c$, d$, e$, f$, g$); // $ExpectType Observable<A | B | C | D | E | F | G>
  const o5 = merge(a$, b$, c$, d$, e$, f$); // $ExpectType Observable<A | B | C | D | E | F>
  const o6 = merge(a$, b$, c$, d$, e$); // $ExpectType Observable<A | B | C | D | E>
  const o7 = merge(a$, b$, c$, d$); // $ExpectType Observable<A | B | C | D>
  const o8 = merge(a$, b$, c$); // $ExpectType Observable<A | B | C>
  const o9 = merge(a$, b$); // $ExpectType Observable<A | B>
  const o10 = merge(a$); // $ExpectType Observable<A>
});

describe('it should infer the result properly with concurrency', () => {
  const o1 = merge(a$, b$, c$, d$, e$, f$, g$, h$, i$, j$, 3); // $ExpectType Observable<A | B | C | D | E | F | G | H | I | J>
  const o2 = merge(a$, b$, c$, d$, e$, f$, g$, h$, i$, 3); // $ExpectType Observable<A | B | C | D | E | F | G | H | I>
  const o3 = merge(a$, b$, c$, d$, e$, f$, g$, h$, 3); // $ExpectType Observable<A | B | C | D | E | F | G | H>
  const o4 = merge(a$, b$, c$, d$, e$, f$, g$, 3); // $ExpectType Observable<A | B | C | D | E | F | G>
  const o5 = merge(a$, b$, c$, d$, e$, f$, 3); // $ExpectType Observable<A | B | C | D | E | F>
  const o6 = merge(a$, b$, c$, d$, e$, 3); // $ExpectType Observable<A | B | C | D | E>
  const o7 = merge(a$, b$, c$, d$, 3); // $ExpectType Observable<A | B | C | D>
  const o8 = merge(a$, b$, c$, 3); // $ExpectType Observable<A | B | C>
  const o9 = merge(a$, b$, 3); // $ExpectType Observable<A | B>
  const o10 = merge(a$, 3); // $ExpectType Observable<A>
});

describe('it should infer the result properly with concurrency and scheduler', () => {
  const o1 = merge(a$, b$, c$, d$, e$, f$, g$, h$, i$, j$, 3, asapScheduler); // $ExpectType Observable<A | B | C | D | E | F | G | H | I | J>
  const o2 = merge(a$, b$, c$, d$, e$, f$, g$, h$, i$, 3, asapScheduler); // $ExpectType Observable<A | B | C | D | E | F | G | H | I>
  const o3 = merge(a$, b$, c$, d$, e$, f$, g$, h$, 3, asapScheduler); // $ExpectType Observable<A | B | C | D | E | F | G | H>
  const o4 = merge(a$, b$, c$, d$, e$, f$, g$, 3, asapScheduler); // $ExpectType Observable<A | B | C | D | E | F | G>
  const o5 = merge(a$, b$, c$, d$, e$, f$, 3, asapScheduler); // $ExpectType Observable<A | B | C | D | E | F>
  const o6 = merge(a$, b$, c$, d$, e$, 3, asapScheduler); // $ExpectType Observable<A | B | C | D | E>
  const o7 = merge(a$, b$, c$, d$, 3, asapScheduler); // $ExpectType Observable<A | B | C | D>
  const o8 = merge(a$, b$, c$, 3, asapScheduler); // $ExpectType Observable<A | B | C>
  const o9 = merge(a$, b$, 3, asapScheduler); // $ExpectType Observable<A | B>
  const o10 = merge(a$, 3, asapScheduler); // $ExpectType Observable<A>
});

describe('it should infer the result properly with scheduler', () => {
  const o1 = merge(a$, b$, c$, d$, e$, f$, g$, h$, i$, j$, asapScheduler); // $ExpectType Observable<A | B | C | D | E | F | G | H | I | J>
  const o2 = merge(a$, b$, c$, d$, e$, f$, g$, h$, i$, asapScheduler); // $ExpectType Observable<A | B | C | D | E | F | G | H | I>
  const o3 = merge(a$, b$, c$, d$, e$, f$, g$, h$, asapScheduler); // $ExpectType Observable<A | B | C | D | E | F | G | H>
  const o4 = merge(a$, b$, c$, d$, e$, f$, g$, asapScheduler); // $ExpectType Observable<A | B | C | D | E | F | G>
  const o5 = merge(a$, b$, c$, d$, e$, f$, asapScheduler); // $ExpectType Observable<A | B | C | D | E | F>
  const o6 = merge(a$, b$, c$, d$, e$, asapScheduler); // $ExpectType Observable<A | B | C | D | E>
  const o7 = merge(a$, b$, c$, d$, asapScheduler); // $ExpectType Observable<A | B | C | D>
  const o8 = merge(a$, b$, c$, asapScheduler); // $ExpectType Observable<A | B | C>
  const o9 = merge(a$, b$, asapScheduler); // $ExpectType Observable<A | B>
  const o10 = merge(a$, asapScheduler); // $ExpectType Observable<A>
});

describe('single array', () => {
  describe('it should infer the result properly', () => {
    const o1 = merge([a$, b$, c$, d$, e$, f$, g$, h$, i$, j$]); // $ExpectType Observable<A | B | C | D | E | F | G | H | I | J>
    const o2 = merge([a$, b$, c$, d$, e$, f$, g$, h$, i$]); // $ExpectType Observable<A | B | C | D | E | F | G | H | I>
    const o3 = merge([a$, b$, c$, d$, e$, f$, g$, h$]); // $ExpectType Observable<A | B | C | D | E | F | G | H>
    const o4 = merge([a$, b$, c$, d$, e$, f$, g$]); // $ExpectType Observable<A | B | C | D | E | F | G>
    const o5 = merge([a$, b$, c$, d$, e$, f$]); // $ExpectType Observable<A | B | C | D | E | F>
    const o6 = merge([a$, b$, c$, d$, e$]); // $ExpectType Observable<A | B | C | D | E>
    const o7 = merge([a$, b$, c$, d$]); // $ExpectType Observable<A | B | C | D>
    const o8 = merge([a$, b$, c$]); // $ExpectType Observable<A | B | C>
    const o9 = merge([a$, b$]); // $ExpectType Observable<A | B>
    const o10 = merge([a$]); // $ExpectType Observable<A>
  });

  describe('it should infer the result properly with concurrency', () => {
    const o1 = merge([a$, b$, c$, d$, e$, f$, g$, h$, i$, j$], 3); // $ExpectType Observable<A | B | C | D | E | F | G | H | I | J>
    const o2 = merge([a$, b$, c$, d$, e$, f$, g$, h$, i$], 3); // $ExpectType Observable<A | B | C | D | E | F | G | H | I>
    const o3 = merge([a$, b$, c$, d$, e$, f$, g$, h$], 3); // $ExpectType Observable<A | B | C | D | E | F | G | H>
    const o4 = merge([a$, b$, c$, d$, e$, f$, g$], 3); // $ExpectType Observable<A | B | C | D | E | F | G>
    const o5 = merge([a$, b$, c$, d$, e$, f$], 3); // $ExpectType Observable<A | B | C | D | E | F>
    const o6 = merge([a$, b$, c$, d$, e$], 3); // $ExpectType Observable<A | B | C | D | E>
    const o7 = merge([a$, b$, c$, d$], 3); // $ExpectType Observable<A | B | C | D>
    const o8 = merge([a$, b$, c$], 3); // $ExpectType Observable<A | B | C>
    const o9 = merge([a$, b$], 3); // $ExpectType Observable<A | B>
    const o10 = merge([a$], 3); // $ExpectType Observable<A>
  });

  describe('it should infer the result properly with concurrency and scheduler', () => {
    const o1 = merge([a$, b$, c$, d$, e$, f$, g$, h$, i$, j$], 3, asapScheduler); // $ExpectType Observable<A | B | C | D | E | F | G | H | I | J>
    const o2 = merge([a$, b$, c$, d$, e$, f$, g$, h$, i$], 3, asapScheduler); // $ExpectType Observable<A | B | C | D | E | F | G | H | I>
    const o3 = merge([a$, b$, c$, d$, e$, f$, g$, h$], 3, asapScheduler); // $ExpectType Observable<A | B | C | D | E | F | G | H>
    const o4 = merge([a$, b$, c$, d$, e$, f$, g$], 3, asapScheduler); // $ExpectType Observable<A | B | C | D | E | F | G>
    const o5 = merge([a$, b$, c$, d$, e$, f$], 3, asapScheduler); // $ExpectType Observable<A | B | C | D | E | F>
    const o6 = merge([a$, b$, c$, d$, e$], 3, asapScheduler); // $ExpectType Observable<A | B | C | D | E>
    const o7 = merge([a$, b$, c$, d$], 3, asapScheduler); // $ExpectType Observable<A | B | C | D>
    const o8 = merge([a$, b$, c$], 3, asapScheduler); // $ExpectType Observable<A | B | C>
    const o9 = merge([a$, b$], 3, asapScheduler); // $ExpectType Observable<A | B>
    const o10 = merge([a$], 3, asapScheduler); // $ExpectType Observable<A>
  });

    describe('it should infer the result properly with scheduler only', () => {
    const o1 = merge([a$, b$, c$, d$, e$, f$, g$, h$, i$, j$],asapScheduler); // $ExpectType Observable<A | B | C | D | E | F | G | H | I | J>
    const o2 = merge([a$, b$, c$, d$, e$, f$, g$, h$, i$],asapScheduler); // $ExpectType Observable<A | B | C | D | E | F | G | H | I>
    const o3 = merge([a$, b$, c$, d$, e$, f$, g$, h$],asapScheduler); // $ExpectType Observable<A | B | C | D | E | F | G | H>
    const o4 = merge([a$, b$, c$, d$, e$, f$, g$],asapScheduler); // $ExpectType Observable<A | B | C | D | E | F | G>
    const o5 = merge([a$, b$, c$, d$, e$, f$],asapScheduler); // $ExpectType Observable<A | B | C | D | E | F>
    const o6 = merge([a$, b$, c$, d$, e$],asapScheduler); // $ExpectType Observable<A | B | C | D | E>
    const o7 = merge([a$, b$, c$, d$],asapScheduler); // $ExpectType Observable<A | B | C | D>
    const o8 = merge([a$, b$, c$],asapScheduler); // $ExpectType Observable<A | B | C>
    const o9 = merge([a$, b$],asapScheduler); // $ExpectType Observable<A | B>
    const o10 = merge([a$],asapScheduler); // $ExpectType Observable<A>
  });
})

describe('the unhappy path', () => {
  const o1 = merge(1, 2, 3, 4, 5); // $ExpectError
  const o2 = merge(a$, asapScheduler, b$); // $ExpectError
  const o3 = merge(a$, 2, b$); // $ExpectError
  const o4 = merge(a$, 2, asapScheduler, b$); // $ExpectError
});