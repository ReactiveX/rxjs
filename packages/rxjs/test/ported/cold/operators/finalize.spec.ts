// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/finalize-spec.ts
import { describe, expect, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { finalize } from 'rxjs/finalize';
describe('finalize (cold)', () => {
  it('should handle empty', async () => {
    await rxTest(async ({ hot, expectObservable, expectSubscriptions, flush: flushMarbles }) => {
      let executed = false;
      const e1 = hot('  |   ');
      const e1subs = '  (^!)';
      const expected = '|   ';
      const result = e1[finalize](() => (executed = true));
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      // manually flush so `finalize()` has chance to execute before the test is over.
      await flushMarbles();
      expect(executed).toBe(true);
    });
  });
  it('should handle never', async () => {
    await rxTest(async ({ hot, expectObservable, expectSubscriptions, advanceTo: advanceTo }) => {
      let executed = false;
      const e1 = hot('  -');
      const e1subs = '^!';
      const expected = '-';
      const result = e1[finalize](() => (executed = true));
      expectObservable(result, '^!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      // manually flush so `finalize()` has chance to execute before the test is over.
      await advanceTo(0);
      expect(executed).toBe(false);
    });
  });
  it('should handle throw', async () => {
    await rxTest(async ({ hot, expectObservable, expectSubscriptions, flush: flushMarbles }) => {
      let executed = false;
      const e1 = hot('  #   ');
      const e1subs = '  (^!)';
      const expected = '#   ';
      const result = e1[finalize](() => (executed = true));
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      // manually flush so `finalize()` has chance to execute before the test is over.
      await flushMarbles();
      expect(executed).toBe(true);
    });
  });
  it('should handle basic hot observable', async () => {
    await rxTest(async ({ hot, expectObservable, expectSubscriptions, flush: flushMarbles }) => {
      let executed = false;
      const e1 = hot('  --a--b--c--|');
      const e1subs = '  ^----------!';
      const expected = '--a--b--c--|';
      const result = e1[finalize](() => (executed = true));
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      // manually flush so `finalize()` has chance to execute before the test is over.
      await flushMarbles();
      expect(executed).toBe(true);
    });
  });
  it('should handle basic cold observable', async () => {
    await rxTest(async ({ cold, expectObservable, expectSubscriptions, flush: flushMarbles }) => {
      let executed = false;
      const e1 = cold(' --a--b--c--|');
      const e1subs = '  ^----------!';
      const expected = '--a--b--c--|';
      const result = e1[finalize](() => (executed = true));
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      // manually flush so `finalize()` has chance to execute before the test is over.
      await flushMarbles();
      expect(executed).toBe(true);
    });
  });
  it('should handle basic error', async () => {
    await rxTest(async ({ hot, expectObservable, expectSubscriptions, flush: flushMarbles }) => {
      let executed = false;
      const e1 = hot('  --a--b--c--#');
      const e1subs = '  ^----------!';
      const expected = '--a--b--c--#';
      const result = e1[finalize](() => (executed = true));
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      // manually flush so `finalize()` has chance to execute before the test is over.
      await flushMarbles();
      expect(executed).toBe(true);
    });
  });
  it('should handle unsubscription', async () => {
    await rxTest(async ({ hot, expectObservable, expectSubscriptions, flush: flushMarbles }) => {
      let executed = false;
      const e1 = hot('  --a--b--c--|');
      const e1subs = '  ^-----!     ';
      const expected = '--a--b-';
      const unsub = '   ------!';
      const result = e1[finalize](() => (executed = true));
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      // manually flush so `finalize()` has chance to execute before the test is over.
      await flushMarbles();
      expect(executed).toBe(true);
    });
  });
});
