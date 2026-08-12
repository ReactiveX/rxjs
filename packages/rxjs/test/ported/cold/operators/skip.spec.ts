// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/skip-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { ColdObservable } from 'rxjs/cold-observable';
import { mergeMap } from 'rxjs/merge-map';
import { skip } from 'rxjs/skip';
describe('skip (cold)', () => {
  it('should skip values before a total', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const source = hot('--a--b--c--d--e--|');
      const subs = '      ^----------------!';
      const expected = '  -----------d--e--|';
      expectObservable(source[skip](3)).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });
  it('should skip all values without error if total is more than actual number of values', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const source = hot('--a--b--c--d--e--|');
      const subs = '      ^----------------!';
      const expected = '  -----------------|';
      expectObservable(source[skip](6)).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });
  it('should skip all values without error if total is same as actual number of values', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const source = hot('--a--b--c--d--e--|');
      const subs = '      ^----------------!';
      const expected = '  -----------------|';
      expectObservable(source[skip](5)).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });
  it('should not skip if count is zero', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const source = hot('--a--b--c--d--e--|');
      const subs = '      ^----------------!';
      const expected = '  --a--b--c--d--e--|';
      expectObservable(source[skip](0)).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });
  it('should not skip if count is negative value', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('--a--b--c--d--e--|');
      const subs = '       ^----------------!';
      const expected = '   --a--b--c--d--e--|';
      expectObservable(source[skip](-42)).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });
  it('should allow unsubscribing explicitly and early', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const source = hot('--a--b--c--d--e--|');
      const unsub = '     ----------!       ';
      const subs = '      ^---------!       ';
      const expected = '  --------c--       ';
      expectObservable(source[skip](2), unsub).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });
  it('should not break unsubscription chains when result is unsubscribed explicitly', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const source = hot('--a--b--c--d--e--|');
      const subs = '      ^---------!       ';
      const expected = '  --------c--       ';
      const unsub = '     ----------!       ';
      const result = source[mergeMap]((x) => ColdObservable.from([x]))
        [skip](2)
        [mergeMap]((x) => ColdObservable.from([x]));
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });
  it('should raise error if skip count is more than actual number of emits and source raises error', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const source = hot('--a--b--c--d--#');
      const subs = '      ^-------------!';
      const expected = '  --------------#';
      expectObservable(source[skip](6)).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });
  it('should raise error if skip count is same as emits of source and source raises error', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const source = hot('--a--b--c--d--#');
      const subs = '      ^-------------!';
      const expected = '  --------------#';
      expectObservable(source[skip](4)).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });
  it('should skip values before a total and raises error if source raises error', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const source = hot('--a--b--c--d--#');
      const subs = '      ^-------------!';
      const expected = '  -----------d--#';
      expectObservable(source[skip](3)).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });
  it('should complete regardless of skip count if source is empty', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' |');
      const e1subs = '  (^!)';
      const expected = '|';
      expectObservable(e1[skip](3)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not complete if source never completes without emit', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -');
      const e1subs = '^!';
      const expected = '-';
      expectObservable(e1[skip](3), '^!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should skip values before total and never completes if source emits and does not complete', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c-');
      const e1subs = '^---------!';
      const expected = '-----b--c-';
      expectObservable(e1[skip](1), '^---------!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should skip all values and never completes if total is more than numbers of value and source does not complete', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c-');
      const e1subs = '^---------!';
      const expected = '----------';
      expectObservable(e1[skip](6), '^---------!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should skip all values and never completes if total is same asnumbers of value and source does not complete', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c-');
      const e1subs = '^---------!';
      const expected = '----------';
      expectObservable(e1[skip](3), '^---------!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should raise error if source throws', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' #');
      const e1subs = '  (^!)';
      const expected = '#';
      expectObservable(e1[skip](3)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
});
