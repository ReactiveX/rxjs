// TypeScript Version: 3.2
import { merge, asapScheduler, Observable } from 'rxjs';
import { a, b, c, d, e, f, g } from '../helpers';

describe('merge typings', () => {
  it('should accept 1 argument', () => {
    const o = merge(a); // $ExpectType Observable<A>
  });

  it('should accept 2 arguments', () => {
    const o = merge(a, b); // $ExpectType Observable<A | B>
  });

  it('should accept 3 arguments', () => {
    const o = merge(a, b, c); // $ExpectType Observable<A | B | C>
  });

  it('should accept 4 arguments', () => {
    const o = merge(a, b, c, d); // $ExpectType Observable<A | B | C | D>
  });

  it('should accept 5 arguments', () => {
    const o = merge(a, b, c, d, e); // $ExpectType Observable<A | B | C | D | E>
  });

  it('should accept 6 arguments', () => {
    const o = merge(a, b, c, d, e, f); // $ExpectType Observable<A | B | C | D | E | F>
  });

  it('should accept more than 6 arguments', () => {
    const o = merge(a, b, c, d, e, f, g); // $ExpectType Observable<A | B | C | D | E | F | G>
  });

  it('should accept a rest of similar arguments', () => {
    const o = merge(...[a, a, a, a, a, a, a, a, a, a, a, a]); // $ExpectType Observable<A>
  });

  it('should accept a rest of different arguments', () => {
    const o = merge(...[a, b, c]); // $ExpectType Observable<A | B | C>
  });

  describe('with concurrency', () => {
    it('should accept 1 argument', () => {
      const o = merge(a, 1); // $ExpectType Observable<A>
    });

    it('should accept 2 arguments', () => {
      const o = merge(a, b, 1); // $ExpectType Observable<A | B>
    });

    it('should accept 3 arguments', () => {
      const o = merge(a, b, c, 1); // $ExpectType Observable<A | B | C>
    });

    it('should accept 4 arguments', () => {
      const o = merge(a, b, c, d, 1); // $ExpectType Observable<A | B | C | D>
    });

    it('should accept 5 arguments', () => {
      const o = merge(a, b, c, d, e, 1); // $ExpectType Observable<A | B | C | D | E>
    });

    it('should accept 6 arguments', () => {
      const o = merge(a, b, c, d, e, f, 1); // $ExpectType Observable<A | B | C | D | E | F>
    });

    it('should accept more than 6 arguments', () => {
      const o = merge(a, b, c, d, e, f, g, 1); // $ExpectType Observable<{}>
    });

    it('should accept a rest of similar arguments', () => {
      const o = merge(...[a, a, a, a, a, a, a, a, a, a, a, a], 1); // $ExpectType Observable<{}>
    });

    it('should accept a rest of different arguments', () => {
      const o = merge(...[a, b, c], 1); // $ExpectType Observable<{}>
    });
  });

  describe('with scheduler', () => {
    it('should accept 1 argument', () => {
      const o = merge(a, asapScheduler); // $ExpectType Observable<A>
    });

    it('should accept 2 arguments', () => {
      const o = merge(a, b, asapScheduler); // $ExpectType Observable<A | B>
    });

    it('should accept 3 arguments', () => {
      const o = merge(a, b, c, asapScheduler); // $ExpectType Observable<A | B | C>
    });

    it('should accept 4 arguments', () => {
      const o = merge(a, b, c, d, asapScheduler); // $ExpectType Observable<A | B | C | D>
    });

    it('should accept 5 arguments', () => {
      const o = merge(a, b, c, d, e, asapScheduler); // $ExpectType Observable<A | B | C | D | E>
    });

    it('should accept 6 arguments', () => {
      const o = merge(a, b, c, d, e, f, asapScheduler); // $ExpectType Observable<A | B | C | D | E | F>
    });

    it('should accept more than 6 arguments', () => {
      const o = merge(a, b, c, d, e, f, g, asapScheduler); // $ExpectType Observable<{}>
    });

    it('should accept a rest of similar arguments', () => {
      const o = merge(...[a, a, a, a, a, a, a, a, a, a, a, a], asapScheduler); // $ExpectType Observable<{}>
    });

    it('should accept a rest of different arguments', () => {
      const o = merge(...[a, b, c], asapScheduler); // $ExpectType Observable<{}>
    });
  });

  describe('with concurrency and a scheduler', () => {
    it('should accept 1 argument', () => {
      const o = merge(a, 1, asapScheduler); // $ExpectType Observable<A>
    });

    it('should accept 2 arguments', () => {
      const o = merge(a, b, 1, asapScheduler); // $ExpectType Observable<A | B>
    });

    it('should accept 3 arguments', () => {
      const o = merge(a, b, c, 1, asapScheduler); // $ExpectType Observable<A | B | C>
    });

    it('should accept 4 arguments', () => {
      const o = merge(a, b, c, d, 1, asapScheduler); // $ExpectType Observable<A | B | C | D>
    });

    it('should accept 5 arguments', () => {
      const o = merge(a, b, c, d, e, 1, asapScheduler); // $ExpectType Observable<A | B | C | D | E>
    });

    it('should accept 6 arguments', () => {
      const o = merge(a, b, c, d, e, f, 1, asapScheduler); // $ExpectType Observable<A | B | C | D | E | F>
    });

    it('should accept more than 6 arguments', () => {
      const o = merge(a, b, c, d, e, f, g, 1, asapScheduler); // $ExpectType Observable<{}>
    });

    it('should accept a rest of similar arguments', () => {
      const o = merge(...[a, a, a, a, a, a, a, a, a, a, a, a], 1, asapScheduler); // $ExpectType Observable<{}>
    });

    it('should accept a rest of different arguments', () => {
      const o = merge(...[a, b, c], 1, asapScheduler); // $ExpectType Observable<{}>
    });
  });

  it('should work for classes extending Observable', () => {
    class Test<T> extends Observable<T> {
    }

    const arr = [new Test<number>(), new Test<string>(), new Test<boolean>()];
    const o = merge(...arr); // $ExpectType Observable<string | number | boolean>
  });
});
