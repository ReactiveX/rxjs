// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/switchAll-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { ColdObservable } from 'rxjs/cold-observable';
import { mergeMap } from 'rxjs/merge-map';
import { switchMap } from 'rxjs/switch-map';
describe('switchAll (cold)', () => {
  it('should switch a hot observable of cold observables', async () => {
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const x = cold('    --a---b--c---d--|      ');
      const xsubs = '   --^------!               ';
      const y = cold('           ----e---f--g---|');
      const ysubs = '   ---------^--------------!';
      const e1 = hot('  --x------y-------|       ', { x: x, y: y });
      const e1subs = '  ^----------------!       ';
      const expected = '----a---b----e---f--g---|';
      const result = e1[switchMap]((value) => value);
      expectObservable(result).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should handle a hot observable of observables', async () => {
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const x = cold('        --a---b---c--|         ');
      const xsubs = '   ------^-------!              ';
      const y = cold('                ---d--e---f---|');
      const ysubs = '   --------------^-------------!';
      const e1 = hot('  ------x-------y------|       ', { x: x, y: y });
      const e1subs = '  ^--------------------!       ';
      const expected = '--------a---b----d--e---f---|';
      const result = e1[switchMap]((value) => value);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
    });
  });
  it('should handle a hot observable of observables, outer is unsubscribed early', async () => {
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const x = cold('        --a---b---c--|         ');
      const xsubs = '   ------^-------!              ';
      const y = cold('                ---d--e---f---|');
      const ysubs = '   --------------^-!            ';
      const e1 = hot('  ------x-------y------|       ', { x: x, y: y });
      const unsub = '   ----------------!            ';
      const expected = '--------a---b---             ';
      const result = e1[switchMap]((value) => value);
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
    });
  });
  it('should not break unsubscription chains when result is unsubscribed explicitly', async () => {
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const x = cold('        --a---b---c--|         ');
      const xsubs = '   ------^-------!              ';
      const y = cold('                ---d--e---f---|');
      const ysubs = '   --------------^-!            ';
      const e1 = hot('  ------x-------y------|       ', { x: x, y: y });
      const expected = '--------a---b----            ';
      const unsub = '   ----------------!            ';
      const result = e1[mergeMap]((x) => ColdObservable.from([x]))
        [switchMap]((value) => value)
        [mergeMap]((x) => ColdObservable.from([x]));
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
    });
  });
  it('should handle a hot observable of observables, inner never completes', async () => {
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const x = cold('        --a---b---c--|          ');
      const xsubs = '   ------^-------!               ';
      const y = cold('                ---d--e---f-----');
      const ysubs = '--------------^---------------!';
      const e1 = hot('  ------x-------y------|        ', { x: x, y: y });
      const expected = '--------a---b----d--e---f-----';
      const result = e1[switchMap]((value) => value);
      expectObservable(result, '^-----------------------------!').toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
    });
  });
  it('should handle a synchronous switch to the second inner observable', async () => {
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const x = cold('        --a---b---c--|   ');
      const xsubs = '   ------(^!)             ';
      const y = cold('        ---d--e---f---|  ');
      const ysubs = '   ------^-------------!  ';
      const e1 = hot('  ------(xy)------------|', { x: x, y: y });
      const expected = '---------d--e---f-----|';
      const result = e1[switchMap]((value) => value);
      expectObservable(result).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
    });
  });
  it('should handle a hot observable of observables, one inner throws', async () => {
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const x = cold('        --a---#                ');
      const xsubs = '   ------^-----!                ';
      const y = cold('                ---d--e---f---|');
      const ysubs = '                                ';
      const e1 = hot('  ------x-------y------|       ', { x: x, y: y });
      const expected = '--------a---#                ';
      const result = e1[switchMap]((value) => value);
      expectObservable(result).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
    });
  });
  it('should handle a hot observable of observables, outer throws', async () => {
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const x = cold('        --a---b---c--|         ');
      const xsubs = '   ------^-------!              ';
      const y = cold('                ---d--e---f---|');
      const ysubs = '   --------------^-------!      ';
      const e1 = hot('  ------x-------y-------#      ', { x: x, y: y });
      const expected = '--------a---b----d--e-#      ';
      const result = e1[switchMap]((value) => value);
      expectObservable(result).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
    });
  });
  it('should handle an empty hot observable', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ------|');
      const e1subs = '  ^-----!';
      const expected = '------|';
      const result = e1[switchMap]((value) => value);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should handle a never hot observable', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -');
      const e1subs = '^!';
      const expected = '-';
      const result = e1[switchMap]((value) => value);
      expectObservable(result, '^!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should complete not before the outer completes', async () => {
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const x = cold('        --a---b---c--|   ');
      const xsubs = '   ------^------------!   ';
      const e1 = hot('  ------x---------------|', { x: x });
      const e1subs = '  ^---------------------!';
      const expected = '--------a---b---c-----|';
      const result = e1[switchMap]((value) => value);
      expectObservable(result).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
});
