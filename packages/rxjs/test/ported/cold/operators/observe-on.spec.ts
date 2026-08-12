// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/observeOn-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { ColdObservable } from 'rxjs/cold-observable';
import { mergeMap } from 'rxjs/merge-map';
import { observeOn } from 'rxjs/observe-on';
describe('observeOn (cold)', () => {
  it('should observe on specified scheduler', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--|');
      const e1subs = '  ^-------!';
      const expected = '--a--b--|';
      expectObservable(e1[observeOn](0)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should observe after specified delay', async () => {
    await rxTest(({ hot, time, expectObservable, expectSubscriptions }) => {
      const e1 = hot('    --a----b-|   ');
      const e1subs = '    ^--------!   ';
      const delay = time('  ---|       ');
      //                         ---|
      //                           ---|
      const expected = '  -----a----b-|';
      expectObservable(e1[observeOn](delay)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should observe when source raises error', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--#');
      const e1subs = '  ^----!';
      const expected = '--a--#';
      expectObservable(e1[observeOn](0)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should observe when source is empty', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -----|');
      const e1subs = '  ^----!';
      const expected = '-----|';
      expectObservable(e1[observeOn](0)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should observe when source does not complete', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -----');
      const e1subs = '^----!';
      const expected = '-----';
      expectObservable(e1[observeOn](0), '^----!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should allow unsubscribing early and explicitly', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--|');
      const e1subs = '  ^---!    ';
      const expected = '--a--    ';
      const unsub = '   ----!    ';
      const result = e1[observeOn](0);
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not break unsubscription chains when the result is unsubscribed explicitly', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--|');
      const e1subs = '  ^---!    ';
      const expected = '--a--    ';
      const unsub = '   ----!    ';
      const result = e1[mergeMap]((x) => ColdObservable.from([x]))
        [observeOn](0)
        [mergeMap]((x) => ColdObservable.from([x]));
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
});
