// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/elementAt-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { ArgumentOutOfRangeError } from 'rxjs/argument-out-of-range-error';
import { elementAt } from 'rxjs/element-at';
import { mergeMap } from 'rxjs/merge-map';
describe('elementAt (platform)', () => {
  it('should return next to last element by zero-based index', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c-d---|');
      const e1subs = '  ^-------!      ';
      const expected = '--------(c|)   ';
      expectObservable(e1[elementAt](2)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should return first element by zero-based index', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--|');
      const e1subs = '  ^-!';
      const expected = '--(a|)';
      expectObservable(e1[elementAt](0)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should allow undefined as a default value', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -----a--a---a-|   ');
      const e1subs = '  ^-------------!   ';
      const expected = '--------------(U|)';
      expectObservable(e1[elementAt](100, undefined)).toBe(expected, { U: undefined });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should return non-first element by zero-based index', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--d--e--f--|');
      const e1subs = '  ^----------!         ';
      const expected = '-----------(d|)      ';
      expectObservable(e1[elementAt](3)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should return last element by zero-based index', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--|');
      const e1subs = '  ^-------!   ';
      const expected = '--------(c|)';
      expectObservable(e1[elementAt](2)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should raise error if e1 is Empty Observable', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' |   ');
      const e1subs = '  (^!)';
      const expected = '#   ';
      expectObservable(e1[elementAt](0)).toBe(expected, undefined, new ArgumentOutOfRangeError());
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should raise error if source throws', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' #   ');
      const e1subs = '  (^!)';
      const expected = '#   ';
      expectObservable(e1[elementAt](0)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not complete if source never completes', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' -');
      const expected = '-';
      const e1subs = '^!';
      expectObservable(e1[elementAt](0), '^!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should allow unsubscribing early and explicitly', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--|');
      const e1subs = '  ^-----!     ';
      const expected = '-------     ';
      const unsub = '   ------!     ';
      const result = e1[elementAt](2);
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not break unsubscription chains when result Observable is unsubscribed', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--|');
      const e1subs = '  ^-----!     ';
      const expected = '-------     ';
      const unsub = '   ------!     ';
      const result = e1[mergeMap]((x) => Observable.from([x]))
        [elementAt](2)
        [mergeMap]((x) => Observable.from([x]));
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should raise error if index is out of range but does not have default value', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--|');
      const e1subs = '  ^----!';
      const expected = '-----#';
      expectObservable(e1[elementAt](3)).toBe(expected, null, new ArgumentOutOfRangeError());
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should return default value if index is out of range', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--|   ');
      const e1subs = '  ^----!   ';
      const expected = '-----(x|)';
      const defaultValue = '42';
      expectObservable(e1[elementAt](3, defaultValue)).toBe(expected, { x: defaultValue });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
});
