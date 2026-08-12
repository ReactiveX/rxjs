// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/takeWhile-spec.ts
import { describe, expect, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { mergeMap } from 'rxjs/merge-map';
import { takeWhile } from 'rxjs/take-while';
import { tap } from 'rxjs/tap';
describe('takeWhile (platform)', () => {
  it('should take all elements until predicate is false', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-1-^2--3--4--5--6--|');
      const e1subs = '   ^------!         ';
      const expected = ' -2--3--|         ';
      const result = e1[takeWhile]((v) => +v < 4);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should take all elements with predicate returns true', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a-^-b--c--d--e--|');
      const e1subs = '    ^-------------!';
      const expected = '  --b--c--d--e--|';
      const result = e1[takeWhile](() => true);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should take all elements with truthy predicate', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a-^-b--c--d--e--|');
      const e1subs = '    ^-------------!';
      const expected = '  --b--c--d--e--|';
      const result = e1[takeWhile](() => {
        return {};
      });
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should skip all elements with predicate returns false', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a-^-b--c--d--e--|');
      const e1subs = '    ^-!            ';
      const expected = '  --|            ';
      const result = e1[takeWhile](() => false);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should skip all elements with falsy predicate', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a-^-b--c--d--e--|');
      const e1subs = '    ^-!            ';
      const expected = '  --|            ';
      const result = e1[takeWhile](() => null);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should take all elements until predicate return false', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a-^-b--c--d--e--|');
      const e1subs = '    ^-------!      ';
      const expected = '  --b--c--|      ';
      function predicate(value) {
        return value !== 'd';
      }
      const result = e1[takeWhile](predicate);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should take all elements up to and including the element that made the predicate return false', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a-^-b--c--d--e--|');
      const e1subs = '    ^-------!      ';
      const expected = '  --b--c--(d|)   ';
      function predicate(value) {
        return value !== 'd';
      }
      const inclusive = true;
      const result = e1[takeWhile](predicate, { includeLast: true });
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should take elements with predicate when source does not complete', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a-^-b--c--d--e--');
      const e1subs = '^-------------!';
      const expected = '  --b--c--d--e--';
      const result = e1[takeWhile](() => true);
      expectObservable(result, '^-------------!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not complete when source never completes', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' -');
      const e1subs = '^!';
      const expected = '-';
      const result = e1[takeWhile](() => true);
      expectObservable(result, '^!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should complete when source does not emit', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a-^------------|');
      const e1subs = '    ^------------!';
      const expected = '  -------------|';
      const result = e1[takeWhile](() => true);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should complete when source is empty', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' |   ');
      const e1subs = '  (^!)';
      const expected = '|   ';
      const result = e1[takeWhile](() => true);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should pass element index to predicate', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a-^-b--c--d--e--|');
      const e1subs = '    ^-------!      ';
      const expected = '  --b--c--|      ';
      function predicate(value, index) {
        return index < 2;
      }
      const result = e1[takeWhile](predicate);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should raise error when source raises error', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a-^-b--c--d--e--#');
      const e1subs = '    ^-------------!';
      const expected = '  --b--c--d--e--#';
      const result = e1[takeWhile](() => true);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should raise error when source throws', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' #   ');
      const e1subs = '  (^!)';
      const expected = '#   ';
      const result = e1[takeWhile](() => true);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should invoke predicate until return false', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a-^-b--c--d--e--|');
      const e1subs = '    ^-------!      ';
      const expected = '  --b--c--|      ';
      let invoked = 0;
      function predicate(value) {
        invoked++;
        return value !== 'd';
      }
      const result = e1[takeWhile](predicate)[tap]({
        complete: () => {
          expect(invoked).toBe(3);
        },
      });
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should raise error if predicate throws', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a-^-b--c--d--e--|');
      const e1subs = '    ^-!            ';
      const expected = '  --#            ';
      function predicate(value) {
        throw 'error';
      }
      const result = e1[takeWhile](predicate);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should take elements until unsubscribed', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a-^-b--c--d--e--|');
      const unsub = '     -----!         ';
      const e1subs = '    ^----!         ';
      const expected = '  --b---         ';
      function predicate(value) {
        return value !== 'd';
      }
      const result = e1[takeWhile](predicate);
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not break unsubscription chain when unsubscribed explicitly', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a-^-b--c--d--e--|');
      const unsub = '     -----!         ';
      const e1subs = '    ^----!         ';
      const expected = '  --b---         ';
      function predicate(value) {
        return value !== 'd';
      }
      const result = e1[mergeMap]((x) => Observable.from([x]))
        [takeWhile](predicate)
        [mergeMap]((x) => Observable.from([x]));
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
});
