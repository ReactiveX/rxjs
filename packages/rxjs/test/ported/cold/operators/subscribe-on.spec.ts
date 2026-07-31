// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/subscribeOn-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { ColdObservable } from 'rxjs/cold-observable';
import { mergeMap } from 'rxjs/merge-map';
import { subscribeOn } from 'rxjs/subscribe-on';
describe('subscribeOn (cold)', () => {
  it('should subscribe on specified scheduler', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--|');
      const expected = '--a--b--|';
      const sub = '     ^-------!';
      const result = e1[subscribeOn](0);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(sub);
    });
  });
  it('should start subscribe after specified delay', async () => {
    await rxTest(({ hot, time, expectObservable, expectSubscriptions }) => {
      const e1 = hot('    --a--b--|');
      const expected = '  -----b--|';
      const delay = time('---|     ');
      const sub = '       ---^----!';
      const result = e1[subscribeOn](delay);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(sub);
    });
  });
  it('should unsubscribe when source raises error', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--#');
      const expected = '--a--#';
      const sub = '     ^----!';
      const result = e1[subscribeOn](0);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(sub);
    });
  });
  it('should subscribe when source is empty', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ----|');
      const expected = '----|';
      const sub = '     ^---!';
      const result = e1[subscribeOn](0);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(sub);
    });
  });
  it('should subscribe when source does not complete', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ----');
      const expected = '----';
      const sub = '^----!';
      const result = e1[subscribeOn](0);
      expectObservable(result, '^----!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(sub);
    });
  });
  it('should allow unsubscribing early and explicitly', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--|');
      const sub = '     ^---!    ';
      const expected = '--a--    ';
      const unsub = '   ----!    ';
      const result = e1[subscribeOn](0);
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(sub);
    });
  });
  it('should not break unsubscription chains when the result is unsubscribed explicitly', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--|');
      const sub = '     ^---!    ';
      const expected = '--a--    ';
      const unsub = '   ----!    ';
      const result = e1[mergeMap]((x) => ColdObservable.from([x]))
        [subscribeOn](0)
        [mergeMap]((x) => ColdObservable.from([x]));
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(sub);
    });
  });
  it('should properly support a delayTime of Infinity', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--|');
      const expected = '---------';
      const result = e1[subscribeOn](Infinity);
      expectObservable(result, '^--------!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe([]);
    });
  });
});
