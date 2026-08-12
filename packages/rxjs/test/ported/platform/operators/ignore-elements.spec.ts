// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/ignoreElements-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { mergeMap } from 'rxjs/merge-map';
describe('ignoreElements (platform)', () => {
  it('should ignore all the elements of the source', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--d--|');
      const e1subs = '  ^-------------!';
      const expected = '--------------|';
      expectObservable(e1[mergeMap](() => Observable.from([]))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should allow unsubscribing early and explicitly', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--d--|');
      const e1subs = '  ^------!       ';
      const expected = '--------       ';
      const unsub = '   -------!       ';
      const result = e1[mergeMap](() => Observable.from([]));
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should allow unsubscribing early and explicitly with higher order', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--d--|');
      const e1subs = '  ^------!       ';
      const expected = '--------       ';
      const unsub = '   -------!       ';
      const result = e1[mergeMap]((x) => Observable.from([x]))
        [mergeMap](() => Observable.from([]))
        [mergeMap]((x) => Observable.from([x]));
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should propagate errors from the source', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--#');
      const e1subs = '  ^----!';
      const expected = '-----#';
      expectObservable(e1[mergeMap](() => Observable.from([]))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should handle empty', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' |   ');
      const e1subs = '  (^!)';
      const expected = '|   ';
      expectObservable(e1[mergeMap](() => Observable.from([]))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should handle never', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' -');
      const e1subs = '^!';
      const expected = '-';
      expectObservable(
        e1[mergeMap](() => Observable.from([])),
        '^!'
      ).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should handle throw', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable('  #  ');
      const e1subs = '  (^!)';
      const expected = '#   ';
      expectObservable(e1[mergeMap](() => Observable.from([]))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
});
