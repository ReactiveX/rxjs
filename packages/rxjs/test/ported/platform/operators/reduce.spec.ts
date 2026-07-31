// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/reduce-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { mergeMap } from 'rxjs/merge-map';
import { reduce } from 'rxjs/reduce';
describe('reduce (platform)', () => {
  it('should reduce', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const values = { a: 1, b: 3, c: 5, x: 9 };
      const e1 = hot('  --a--b--c--|   ', values);
      const e1subs = '  ^----------!   ';
      const expected = '-----------(x|)';
      const result = e1[reduce]((o, x) => o + x, 0);
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should reduce with seed', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--|   ');
      const e1subs = '  ^-------!   ';
      const expected = '--------(x|)';
      const result = e1[reduce]((o, x) => o + ' ' + x, 'n');
      expectObservable(result).toBe(expected, { x: 'n a b' });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should reduce with a seed of undefined', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^--b--c--d--e--f--g--|   ');
      const e1subs = '     ^--------------------!   ';
      const expected = '   ---------------------(x|)';
      const result = e1[reduce]((o, x) => o + ' ' + x, undefined);
      expectObservable(result).toBe(expected, { x: 'undefined b c d e f g' });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should reduce without a seed', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^--b--c--d--e--f--g--|   ');
      const e1subs = '     ^--------------------!   ';
      const expected = '   ---------------------(x|)';
      const result = e1[reduce]((o, x) => o + ' ' + x);
      expectObservable(result).toBe(expected, { x: 'b c d e f g' });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should reduce with seed if source is empty', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^-------|   ');
      const e1subs = '     ^-------!   ';
      const expected = '   --------(x|)';
      const result = e1[reduce]((o, x) => o + x, '42');
      expectObservable(result).toBe(expected, { x: '42' });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should raise error if reduce function throws without seed', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--|');
      const e1subs = '  ^----!   ';
      const expected = '-----#   ';
      const result = e1[reduce](() => {
        throw 'error';
      });
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should allow unsubscribing explicitly and early', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--|');
      const e1subs = '  ^-----!  ';
      const expected = '-------  ';
      const unsub = '   ------!  ';
      const result = e1[reduce]((o, x) => o + x);
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not break unsubscription chains when result is unsubscribed explicitly', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--|');
      const e1subs = '  ^-----!  ';
      const expected = '-------  ';
      const unsub = '   ------!  ';
      const result = e1[mergeMap]((x) => Observable.from([x]))
        [reduce]((o, x) => o + x)
        [mergeMap]((x) => Observable.from([x]));
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should raise error if source emits and raises error with seed', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--#');
      const e1subs = '  ^-------!';
      const expected = '--------#';
      const result = e1[reduce]((o, x) => o + x, '42');
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should raise error if source raises error with seed', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ----#');
      const e1subs = '  ^---!';
      const expected = '----#';
      const result = e1[reduce]((o, x) => o + x, '42');
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should raise error if reduce function throws with seed', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--|');
      const e1subs = '  ^-!      ';
      const expected = '--#      ';
      const result = e1[reduce](() => {
        throw 'error';
      }, 'n');
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not complete with seed if source emits but does not complete', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--');
      const e1subs = '^----!';
      const expected = '-----';
      const result = e1[reduce]((o, x) => o + x, 'n');
      expectObservable(result, '^----!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not complete with seed if source never completes', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' -');
      const e1subs = '^!';
      const expected = '-';
      const result = e1[reduce]((o, x) => o + x, 'n');
      expectObservable(result, '^!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not complete without seed if source emits but does not completes', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--');
      const e1subs = '^-------!';
      const expected = '--------';
      const result = e1[reduce]((o, x) => o + x);
      expectObservable(result, '^-------!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not complete without seed if source never completes', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' -');
      const e1subs = '^!';
      const expected = '-';
      const result = e1[reduce]((o, x) => o + x);
      expectObservable(result, '^!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should reduce if source does not emit without seed', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^-------|');
      const e1subs = '     ^-------!';
      const expected = '   --------|';
      const result = e1[reduce]((o, x) => o + x);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should raise error if source emits and raises error without seed', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--#');
      const e1subs = '  ^-------!';
      const expected = '--------#';
      const result = e1[reduce]((o, x) => o + x);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should raise error if source raises error without seed', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ----#');
      const e1subs = '  ^---!';
      const expected = '----#';
      const result = e1[reduce]((o, x) => o + x);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
});
