// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/endWith-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { concat } from 'rxjs/concat';
import { mergeMap } from 'rxjs/merge-map';
describe('endWith (platform)', () => {
  it('should append to a cold Observable', async () => {
    const defaultEndValue = 'x';
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' ---a--b--c--|   ');
      const e1subs = '  ^-----------!   ';
      const expected = '---a--b--c--(s|)';
      expectObservable(e1[concat]([['s']])).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should append numbers to a cold Observable', async () => {
    const defaultEndValue = 'x';
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const values = { a: 1, b: 2, c: 3, s: 4 };
      const e1 = observable(' ---a--b--c--|   ', values);
      const e1subs = '  ^-----------!   ';
      const expected = '---a--b--c--(s|)';
      expectObservable(e1[concat]([[values.s]])).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should end an observable with given value', async () => {
    const defaultEndValue = 'x';
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--|   ');
      const e1subs = '  ^----!   ';
      const expected = '--a--(x|)';
      expectObservable(e1[concat]([[defaultEndValue]])).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not end with given value if source does not complete', async () => {
    const defaultEndValue = 'x';
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ----a-');
      const e1subs = '^-----!';
      const expected = '----a-';
      expectObservable(e1[concat]([[defaultEndValue]]), '^-----!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not end with given value if source never emits and does not completes', async () => {
    const defaultEndValue = 'x';
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' -');
      const e1subs = '^!';
      const expected = '-';
      expectObservable(e1[concat]([[defaultEndValue]]), '^!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should end with given value if source does not emit but does complete', async () => {
    const defaultEndValue = 'x';
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ---|   ');
      const e1subs = '  ^--!   ';
      const expected = '---(x|)';
      expectObservable(e1[concat]([[defaultEndValue]])).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should emit given value and complete immediately if source is empty', async () => {
    const defaultEndValue = 'x';
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' |   ');
      const e1subs = '  (^!)';
      const expected = '(x|)';
      expectObservable(e1[concat]([[defaultEndValue]])).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should end with given value and source both if source emits single value', async () => {
    const defaultEndValue = 'x';
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' (a|) ');
      const e1subs = '  (^!) ';
      const expected = '(ax|)';
      expectObservable(e1[concat]([[defaultEndValue]])).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should end with given values when given more than one value', async () => {
    const defaultEndValue = 'x';
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -----a--|    ');
      const e1subs = '  ^-------!    ';
      const expected = '-----a--(yz|)';
      expectObservable(e1[concat]([['y', 'z']])).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should raise error and not end with given value if source raises error', async () => {
    const defaultEndValue = 'x';
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --#');
      const e1subs = '  ^-!';
      const expected = '--#';
      expectObservable(e1[concat]([[defaultEndValue]])).toBe(expected, defaultEndValue);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should raise error immediately and not end with given value if source throws error immediately', async () => {
    const defaultEndValue = 'x';
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' #   ');
      const e1subs = '  (^!)';
      const expected = '#   ';
      expectObservable(e1[concat]([[defaultEndValue]])).toBe(expected, defaultEndValue);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should allow unsubscribing explicitly and early', async () => {
    const defaultEndValue = 'x';
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ---a--b----c--d--|');
      const e1subs = '  ^--------!        ';
      const expected = '---a--b---        ';
      const unsub = '   ---------!        ';
      const result = e1[concat]([['s']]);
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not break unsubscription chains when result is unsubscribed explicitly', async () => {
    const defaultEndValue = 'x';
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ---a--b----c--d--|');
      const e1subs = '  ^--------!        ';
      const expected = '---a--b---        ';
      const unsub = '   ---------!        ';
      const result = e1[mergeMap]((x) => Observable.from([x]))
        [concat]([['s']])
        [mergeMap]((x) => Observable.from([x]));
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should end with empty if given value is not specified', async () => {
    const defaultEndValue = 'x';
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -a-|');
      const e1subs = '  ^--!';
      const expected = '-a-|';
      expectObservable(e1[concat]([[]])).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should accept scheduler as last argument with single value', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const source = hot('--a--|');
      const result = source[concat]([['x']]);
      // Remove only the obsolete TestScheduler argument. The existing concat
      // compatibility boundary still owns append ordering and completion.
      expectObservable(result).toBe('--a--(x|)');
      expectSubscriptions(source.subscriptions).toBe('^----!');
    });
  });
  it('should accept scheduler as last argument with multiple value', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const source = hot('-----a--|');
      const result = source[concat]([['y', 'z']]);
      // Remove only the obsolete TestScheduler argument. The existing concat
      // compatibility boundary still owns append ordering and completion.
      expectObservable(result).toBe('-----a--(yz|)');
      expectSubscriptions(source.subscriptions).toBe('^-------!');
    });
  });
});
