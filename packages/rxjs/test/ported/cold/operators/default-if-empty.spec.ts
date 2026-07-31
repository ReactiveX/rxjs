// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/defaultIfEmpty-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { ColdObservable } from 'rxjs/cold-observable';
import { defaultIfEmpty } from 'rxjs/default-if-empty';
import { mergeMap } from 'rxjs/merge-map';
describe('defaultIfEmpty (cold)', () => {
  it('should return the Observable if not empty with a default value', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --------|');
      const e1subs = '  ^-------!';
      const expected = '--------(x|)';
      expectObservable(e1[defaultIfEmpty](42)).toBe(expected, { x: 42 });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should return the argument if Observable is empty', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' |');
      const e1subs = '  (^!)';
      const expected = '(x|)';
      expectObservable(e1[defaultIfEmpty]('x')).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should return the Observable if not empty with a default value', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--|');
      const e1subs = '  ^-------!';
      const expected = '--a--b--|';
      expectObservable(e1[defaultIfEmpty]('x')).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should allow undefined as a default value', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --------|');
      const e1subs = '  ^-------!';
      const expected = '--------(U|)';
      expectObservable(e1[defaultIfEmpty](undefined)).toBe(expected, { U: undefined });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should allow unsubscribing early and explicitly', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--|');
      const e1subs = '  ^---!    ';
      const expected = '--a--    ';
      const unsub = '   ----!    ';
      const result = e1[defaultIfEmpty]('x');
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not break unsubscription chains when unsubscribed explicitly', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--|');
      const e1subs = '  ^---!    ';
      const expected = '--a--    ';
      const unsub = '   ----!    ';
      const result = e1[mergeMap]((x) => ColdObservable.from([x]))
        [defaultIfEmpty]('x')
        [mergeMap]((x) => ColdObservable.from([x]));
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should error if the Observable errors', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' #');
      const e1subs = '  (^!)';
      const expected = '#';
      expectObservable(e1[defaultIfEmpty]('x')).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
});
