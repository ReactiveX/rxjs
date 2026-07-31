// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/startWith-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { mergeMap } from 'rxjs/merge-map';
import { startWith } from 'rxjs/start-with';
describe('startWith (platform)', () => {
  it('should prepend to a cold Observable', async () => {
    const defaultStartValue = 'x';
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' ---a--b--c--|');
      const e1subs = '  ^-----------!';
      const expected = 's--a--b--c--|';
      const result = e1[startWith]('s');
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should start an observable with given value', async () => {
    const defaultStartValue = 'x';
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--|');
      const e1subs = '  ^----!';
      const expected = 'x-a--|';
      const result = e1[startWith](defaultStartValue);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should start with given value and does not completes if source does not completes', async () => {
    const defaultStartValue = 'x';
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ----a-');
      const e1subs = '^-----!';
      const expected = 'x---a-';
      const result = e1[startWith](defaultStartValue);
      expectObservable(result, '^-----!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should start with given value and does not completes if source never emits', async () => {
    const defaultStartValue = 'x';
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' - ');
      const e1subs = '^-!';
      const expected = 'x-';
      const result = e1[startWith](defaultStartValue);
      expectObservable(result, '^-!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should start with given value and completes if source does not emits', async () => {
    const defaultStartValue = 'x';
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ---|');
      const e1subs = '  ^--!';
      const expected = 'x--|';
      const result = e1[startWith](defaultStartValue);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should start with given value and complete immediately if source is empty', async () => {
    const defaultStartValue = 'x';
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' |   ');
      const e1subs = '  (^!)';
      const expected = '(x|)';
      const result = e1[startWith](defaultStartValue);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should start with given value and source both if source emits single value', async () => {
    const defaultStartValue = 'x';
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' (a|)');
      const e1subs = '  (^!)';
      const expected = '(xa|)';
      const result = e1[startWith](defaultStartValue);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should start with given values when given value is more than one', async () => {
    const defaultStartValue = 'x';
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -----a--|');
      const e1subs = '  ^-------!';
      const expected = '(yz)-a--|';
      const result = e1[startWith]('y', 'z');
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should start with given value and raises error if source raises error', async () => {
    const defaultStartValue = 'x';
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --#');
      const e1subs = '  ^-!';
      const expected = 'x-#';
      const result = e1[startWith](defaultStartValue);
      expectObservable(result).toBe(expected, { x: defaultStartValue });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should start with given value and raises error immediately if source throws error', async () => {
    const defaultStartValue = 'x';
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' #   ');
      const e1subs = '  (^!)';
      const expected = '(x#)';
      const result = e1[startWith](defaultStartValue);
      expectObservable(result).toBe(expected, { x: defaultStartValue });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should allow unsubscribing explicitly and early', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const source = hot('---a--b----c--d--|');
      const result = source[startWith]('s');
      // Remove only the obsolete TestScheduler argument. The exact startWith
      // Symbol still owns all values, timing, and cancellation in this claim.
      expectObservable(result, '^--------!').toBe('s--a--b--', {
        s: 's',
        a: 'a',
        b: 'b',
      });
      expectSubscriptions(source.subscriptions).toBe('^--------!');
    });
  });
  it('should not break unsubscription chains when result is unsubscribed explicitly', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const source = hot('---a--b----c--d--|');
      const result = source[mergeMap]((value) => Observable.from([value]))
        [startWith]('s')
        [mergeMap]((value) => Observable.from([value]));
      // Remove only the obsolete TestScheduler argument. The exact startWith
      // Symbol still owns all values, timing, and cancellation in this claim.
      expectObservable(result, '^--------!').toBe('s--a--b--', {
        s: 's',
        a: 'a',
        b: 'b',
      });
      expectSubscriptions(source.subscriptions).toBe('^--------!');
    });
  });
  it('should start with empty if given value is not specified', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const source = hot('-a-|');
      const result = source[startWith]();
      // Remove only the obsolete TestScheduler argument. The exact startWith
      // Symbol still owns all values, timing, and cancellation in this claim.
      expectObservable(result).toBe('-a-|');
      expectSubscriptions(source.subscriptions).toBe('^--!');
    });
  });
  it('should accept scheduler as last argument with single value', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const source = hot('--a--|');
      const result = source[startWith]('x');
      // Remove only the obsolete TestScheduler argument. The exact startWith
      // Symbol still owns all values, timing, and cancellation in this claim.
      expectObservable(result).toBe('x-a--|');
      expectSubscriptions(source.subscriptions).toBe('^----!');
    });
  });
  it('should accept scheduler as last argument with multiple value', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const source = hot('-----a--|');
      const result = source[startWith]('y', 'z');
      // Remove only the obsolete TestScheduler argument. The exact startWith
      // Symbol still owns all values, timing, and cancellation in this claim.
      expectObservable(result).toBe('(yz)-a--|');
      expectSubscriptions(source.subscriptions).toBe('^-------!');
    });
  });
});
