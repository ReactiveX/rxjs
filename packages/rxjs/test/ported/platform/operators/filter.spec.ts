// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/filter-spec.ts
import { describe, expect, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { filter } from 'rxjs/filter';
import { map } from 'rxjs/map';
import { mergeMap } from 'rxjs/merge-map';
import { tap } from 'rxjs/tap';
describe('filter (platform)', () => {
  it('should filter out even values', async () => {
    function oddFilter(x) {
      return +x % 2 === 1;
    }
    function isPrime(i) {
      if (+i <= 1) {
        return false;
      }
      const max = Math.floor(Math.sqrt(+i));
      for (let j = 2; j <= max; ++j) {
        if (+i % j === 0) {
          return false;
        }
      }
      return true;
    }
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --0--1--2--3--4--|');
      const e1subs = '  ^----------------!';
      const expected = '-----1-----3-----|';
      expectObservable(e1[filter](oddFilter)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should filter in only prime numbers', async () => {
    function oddFilter(x) {
      return +x % 2 === 1;
    }
    function isPrime(i) {
      if (+i <= 1) {
        return false;
      }
      const max = Math.floor(Math.sqrt(+i));
      for (let j = 2; j <= max; ++j) {
        if (+i % j === 0) {
          return false;
        }
      }
      return true;
    }
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-1--2--^-3-4-5-6--7-8--9--|');
      const e1subs = '       ^------------------!';
      const expected = '     --3---5----7-------|';
      expectObservable(e1[filter](isPrime)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should filter with an always-true predicate', async () => {
    function oddFilter(x) {
      return +x % 2 === 1;
    }
    function isPrime(i) {
      if (+i <= 1) {
        return false;
      }
      const max = Math.floor(Math.sqrt(+i));
      for (let j = 2; j <= max; ++j) {
        if (+i % j === 0) {
          return false;
        }
      }
      return true;
    }
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-1--2--^-3-4-5-6--7-8--9--|');
      const e1subs = '       ^------------------!';
      const expected = '     --3-4-5-6--7-8--9--|';
      const predicate = () => {
        return true;
      };
      expectObservable(e1[filter](predicate)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should filter with an always-false predicate', async () => {
    function oddFilter(x) {
      return +x % 2 === 1;
    }
    function isPrime(i) {
      if (+i <= 1) {
        return false;
      }
      const max = Math.floor(Math.sqrt(+i));
      for (let j = 2; j <= max; ++j) {
        if (+i % j === 0) {
          return false;
        }
      }
      return true;
    }
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-1--2--^-3-4-5-6--7-8--9--|');
      const e1subs = '       ^------------------!';
      const expected = '     -------------------|';
      const predicate = () => {
        return false;
      };
      expectObservable(e1[filter](predicate)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should filter in only prime numbers, source unsubscribes early', async () => {
    function oddFilter(x) {
      return +x % 2 === 1;
    }
    function isPrime(i) {
      if (+i <= 1) {
        return false;
      }
      const max = Math.floor(Math.sqrt(+i));
      for (let j = 2; j <= max; ++j) {
        if (+i % j === 0) {
          return false;
        }
      }
      return true;
    }
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-1--2--^-3-4-5-6--7-8--9--|');
      const e1subs = '       ^-----------!       ';
      const expected = '     --3---5----7-       ';
      const unsub = '        ------------!       ';
      expectObservable(e1[filter](isPrime), unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should filter in only prime numbers, source throws', async () => {
    function oddFilter(x) {
      return +x % 2 === 1;
    }
    function isPrime(i) {
      if (+i <= 1) {
        return false;
      }
      const max = Math.floor(Math.sqrt(+i));
      for (let j = 2; j <= max; ++j) {
        if (+i % j === 0) {
          return false;
        }
      }
      return true;
    }
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-1--2--^-3-4-5-6--7-8--9--#');
      const e1subs = '       ^------------------!';
      const expected = '     --3---5----7-------#';
      expectObservable(e1[filter](isPrime)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should filter in only prime numbers, but predicate throws', async () => {
    function oddFilter(x) {
      return +x % 2 === 1;
    }
    function isPrime(i) {
      if (+i <= 1) {
        return false;
      }
      const max = Math.floor(Math.sqrt(+i));
      for (let j = 2; j <= max; ++j) {
        if (+i % j === 0) {
          return false;
        }
      }
      return true;
    }
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-1--2--^-3-4-5-6--7-8--9--|');
      const e1subs = '       ^-------!           ';
      const expected = '     --3---5-#           ';
      let invoked = 0;
      function predicate(x) {
        invoked++;
        if (invoked === 4) {
          throw 'error';
        }
        return isPrime(x);
      }
      expectObservable(e1[filter](predicate)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should filter in only prime numbers, predicate with index', async () => {
    function oddFilter(x) {
      return +x % 2 === 1;
    }
    function isPrime(i) {
      if (+i <= 1) {
        return false;
      }
      const max = Math.floor(Math.sqrt(+i));
      for (let j = 2; j <= max; ++j) {
        if (+i % j === 0) {
          return false;
        }
      }
      return true;
    }
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-1--2--^-3-4-5-6--7-8--9--|');
      const e1subs = '       ^------------------!';
      const expected = '     --3--------7-------|';
      function predicate(x, i) {
        return isPrime(+x + i * 10);
      }
      expectObservable(e1[filter](predicate)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should invoke predicate once for each checked value', async () => {
    function oddFilter(x) {
      return +x % 2 === 1;
    }
    function isPrime(i) {
      if (+i <= 1) {
        return false;
      }
      const max = Math.floor(Math.sqrt(+i));
      for (let j = 2; j <= max; ++j) {
        if (+i % j === 0) {
          return false;
        }
      }
      return true;
    }
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-1--2--^-3-4-5-6--7-8--9--|');
      const e1subs = '       ^------------------!';
      const expected = '     --3---5----7-------|';
      let invoked = 0;
      const predicate = (x) => {
        invoked++;
        return isPrime(x);
      };
      const result = e1[filter](predicate)[tap]({
        complete: () => {
          expect(invoked).toBe(7);
        },
      });
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should filter in only prime numbers, predicate with index, source unsubscribes early', async () => {
    function oddFilter(x) {
      return +x % 2 === 1;
    }
    function isPrime(i) {
      if (+i <= 1) {
        return false;
      }
      const max = Math.floor(Math.sqrt(+i));
      for (let j = 2; j <= max; ++j) {
        if (+i % j === 0) {
          return false;
        }
      }
      return true;
    }
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-1--2--^-3-4-5-6--7-8--9--|');
      const e1subs = '       ^-----------!       ';
      const expected = '     --3--------7-       ';
      const unsub = '        ------------!       ';
      function predicate(x, i) {
        return isPrime(+x + i * 10);
      }
      expectObservable(e1[filter](predicate), unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should filter in only prime numbers, predicate with index, source throws', async () => {
    function oddFilter(x) {
      return +x % 2 === 1;
    }
    function isPrime(i) {
      if (+i <= 1) {
        return false;
      }
      const max = Math.floor(Math.sqrt(+i));
      for (let j = 2; j <= max; ++j) {
        if (+i % j === 0) {
          return false;
        }
      }
      return true;
    }
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-1--2--^-3-4-5-6--7-8--9--#');
      const e1subs = '       ^------------------!';
      const expected = '     --3--------7-------#';
      function predicate(x, i) {
        return isPrime(+x + i * 10);
      }
      expectObservable(e1[filter](predicate)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should filter in only prime numbers, predicate with index and throws', async () => {
    function oddFilter(x) {
      return +x % 2 === 1;
    }
    function isPrime(i) {
      if (+i <= 1) {
        return false;
      }
      const max = Math.floor(Math.sqrt(+i));
      for (let j = 2; j <= max; ++j) {
        if (+i % j === 0) {
          return false;
        }
      }
      return true;
    }
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-1--2--^-3-4-5-6--7-8--9--|');
      const e1subs = '       ^-------!           ';
      const expected = '     --3-----#           ';
      let invoked = 0;
      function predicate(x, i) {
        invoked++;
        if (invoked === 4) {
          throw 'error';
        }
        return isPrime(+x + i * 10);
      }
      expectObservable(e1[filter](predicate)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should compose with another filter to allow multiples of six', async () => {
    function oddFilter(x) {
      return +x % 2 === 1;
    }
    function isPrime(i) {
      if (+i <= 1) {
        return false;
      }
      const max = Math.floor(Math.sqrt(+i));
      for (let j = 2; j <= max; ++j) {
        if (+i % j === 0) {
          return false;
        }
      }
      return true;
    }
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-1--2--^-3-4-5-6--7-8--9--|');
      const e1subs = '       ^------------------!';
      const expected = '     --------6----------|';
      const result = e1[filter]((x) => +x % 2 === 0)[filter]((x) => +x % 3 === 0);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should be able to use closed-over predicates', async () => {
    function oddFilter(x) {
      return +x % 2 === 1;
    }
    function isPrime(i) {
      if (+i <= 1) {
        return false;
      }
      const max = Math.floor(Math.sqrt(+i));
      for (let j = 2; j <= max; ++j) {
        if (+i % j === 0) {
          return false;
        }
      }
      return true;
    }
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-1--2--^-3-4-5-6--7-8--9--|');
      const e1subs = '       ^------------------!';
      const expected = '     --------6----------|';
      class Filterer {
        filter1 = (x) => +x % 2 === 0;
        filter2 = (x) => +x % 3 === 0;
      }
      const filterer = new Filterer();
      const result = e1[filter](filterer.filter1)[filter](filterer.filter2)[filter](filterer.filter1);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should be able to use filter and map composed', async () => {
    function oddFilter(x) {
      return +x % 2 === 1;
    }
    function isPrime(i) {
      if (+i <= 1) {
        return false;
      }
      const max = Math.floor(Math.sqrt(+i));
      for (let j = 2; j <= max; ++j) {
        if (+i % j === 0) {
          return false;
        }
      }
      return true;
    }
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-1--2--^-3-4-5-6--7-8--9--|');
      const e1subs = '       ^------------------!';
      const expected = '     ----a---b----c-----|';
      const values = { a: 16, b: 36, c: 64 };
      const result = e1[filter]((x) => +x % 2 === 0)[map]((x) => +x * +x);
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should propagate errors from the source', async () => {
    function oddFilter(x) {
      return +x % 2 === 1;
    }
    function isPrime(i) {
      if (+i <= 1) {
        return false;
      }
      const max = Math.floor(Math.sqrt(+i));
      for (let j = 2; j <= max; ++j) {
        if (+i % j === 0) {
          return false;
        }
      }
      return true;
    }
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --0--1--2--3--4--#');
      const e1subs = '  ^----------------!';
      const expected = '-----1-----3-----#';
      expectObservable(e1[filter](oddFilter)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should handle empty', async () => {
    function oddFilter(x) {
      return +x % 2 === 1;
    }
    function isPrime(i) {
      if (+i <= 1) {
        return false;
      }
      const max = Math.floor(Math.sqrt(+i));
      for (let j = 2; j <= max; ++j) {
        if (+i % j === 0) {
          return false;
        }
      }
      return true;
    }
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' |   ');
      const e1subs = '  (^!)';
      const expected = '|   ';
      expectObservable(e1[filter](oddFilter)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should handle never', async () => {
    function oddFilter(x) {
      return +x % 2 === 1;
    }
    function isPrime(i) {
      if (+i <= 1) {
        return false;
      }
      const max = Math.floor(Math.sqrt(+i));
      for (let j = 2; j <= max; ++j) {
        if (+i % j === 0) {
          return false;
        }
      }
      return true;
    }
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' -');
      const e1subs = '^!';
      const expected = '-';
      expectObservable(e1[filter](oddFilter), '^!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should handle throw', async () => {
    function oddFilter(x) {
      return +x % 2 === 1;
    }
    function isPrime(i) {
      if (+i <= 1) {
        return false;
      }
      const max = Math.floor(Math.sqrt(+i));
      for (let j = 2; j <= max; ++j) {
        if (+i % j === 0) {
          return false;
        }
      }
      return true;
    }
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' #   ');
      const e1subs = '  (^!)';
      const expected = '#   ';
      expectObservable(e1[filter](oddFilter)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not break unsubscription chain when unsubscribed explicitly', async () => {
    function oddFilter(x) {
      return +x % 2 === 1;
    }
    function isPrime(i) {
      if (+i <= 1) {
        return false;
      }
      const max = Math.floor(Math.sqrt(+i));
      for (let j = 2; j <= max; ++j) {
        if (+i % j === 0) {
          return false;
        }
      }
      return true;
    }
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-1--2--^-3-4-5-6--7-8--9--|');
      const e1subs = '       ^-----------!       ';
      const expected = '     --3---5----7-       ';
      const unsub = '        ------------!       ';
      const result = e1[mergeMap]((x) => Observable.from([x]))
        [filter](isPrime)
        [mergeMap]((x) => Observable.from([x]));
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should support Boolean as a predicate', async () => {
    function oddFilter(x) {
      return +x % 2 === 1;
    }
    function isPrime(i) {
      if (+i <= 1) {
        return false;
      }
      const max = Math.floor(Math.sqrt(+i));
      for (let j = 2; j <= max; ++j) {
        if (+i % j === 0) {
          return false;
        }
      }
      return true;
    }
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const values = { t: 1, f: 0 };
      const e1 = hot('-t--f--^-t-f-t-f--t-f--f--|', values);
      const e1subs = '       ^------------------!';
      const expected = '     --t---t----t-------|';
      expectObservable(e1[filter](Boolean)).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
});
