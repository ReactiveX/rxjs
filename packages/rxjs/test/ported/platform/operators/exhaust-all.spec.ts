// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/exhaustAll-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { exhaustMap } from 'rxjs/exhaust-map';
import { mergeMap } from 'rxjs/merge-map';
describe('exhaustAll (platform)', () => {
  it('should handle a hot observable of hot observables', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const x = hot('   -----a---b---c--|                  ');
      const xsubs = '   ------^---------!                  ';
      const y = hot('   -------d--e---f---|                ');
      const ysubs = [];
      const z = hot('   --------------g--h---i---|         ');
      const zsubs = '   --------------------^----!         ';
      const e1 = hot('  ------x-------y-----z-------------|', { x: x, y: y, z: z });
      const e1subs = '  ^---------------------------------!';
      const expected = '---------b---c-------i------------|';
      expectObservable(e1[exhaustMap]((value) => value)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(z.subscriptions).toBe(zsubs);
    });
  });
  it('should switch to first immediately-scheduled inner Observable', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' (ab|)');
      const e1subs = '  (^!) ';
      const e2 = observable(' (cd|)');
      const e2subs = [];
      const expected = '(ab|)';
      expectObservable(Observable.from([e1, e2])[exhaustMap]((value) => value)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should handle throw', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' #   ');
      const e1subs = '  (^!)';
      const expected = '#   ';
      expectObservable(e1[exhaustMap]((value) => value)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should handle empty', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' |   ');
      const e1subs = '  (^!)';
      const expected = '|   ';
      expectObservable(e1[exhaustMap]((value) => value)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should handle never', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' -');
      const e1subs = '^!';
      const expected = '-';
      expectObservable(
        e1[exhaustMap]((value) => value),
        '^!'
      ).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should handle a hot observable of observables', async () => {
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const x = observable('        --a---b---c--|               ');
      const xsubs = '   ------^------------!               ';
      const y = observable('                ---d--e---f---|      ');
      const ysubs = [];
      const z = observable('                      ---g--h---i---|');
      const zsubs = '   --------------------^-------------!';
      const e1 = hot('  ------x-------y-----z-------------|', { x: x, y: y, z: z });
      const e1subs = '  ^---------------------------------!';
      const expected = '--------a---b---c------g--h---i---|';
      expectObservable(e1[exhaustMap]((value) => value)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(z.subscriptions).toBe(zsubs);
    });
  });
  it('should handle a hot observable of observables, outer is unsubscribed early', async () => {
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const x = observable('        --a---b---c--|         ');
      const xsubs = '   ------^---------!            ';
      const y = observable('                ---d--e---f---|');
      const ysubs = [];
      const e1 = hot('  ------x-------y------|       ', { x: x, y: y });
      const unsub = '   ----------------!            ';
      const expected = '--------a---b----            ';
      expectObservable(
        e1[exhaustMap]((value) => value),
        unsub
      ).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
    });
  });
  it('should not break unsubscription chains when result is unsubscribed explicitly', async () => {
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const x = observable('        --a---b---c--|         ');
      const xsubs = '   ------^---------!            ';
      const y = observable('                ---d--e---f---|');
      const ysubs = [];
      const e1 = hot('  ------x-------y------|       ', { x: x, y: y });
      const unsub = '   ----------------!            ';
      const expected = '--------a---b----            ';
      const result = e1[mergeMap]((x) => Observable.from([x]))
        [exhaustMap]((value) => value)
        [mergeMap]((x) => Observable.from([x]));
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
    });
  });
  it('should handle a hot observable of observables, inner never completes', async () => {
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const x = observable('     --a---b--|              ');
      const xsubs = '   ---^--------!              ';
      const y = observable('         -d---e-             ');
      const ysubs = [];
      const z = observable('                ---f--g---h--');
      const zsubs = '--------------^------------!';
      const e1 = hot('  ---x---y------z----------| ', { x: x, y: y, z: z });
      const expected = '-----a---b-------f--g---h--';
      expectObservable(
        e1[exhaustMap]((value) => value),
        '^--------------------------!'
      ).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(z.subscriptions).toBe(zsubs);
    });
  });
  it('should handle a synchronous switch and stay on the first inner observable', async () => {
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const x = observable('        --a---b---c--|   ');
      const xsubs = '   ------^------------!   ';
      const y = observable('        ---d--e---f---|  ');
      const ysubs = [];
      const e1 = hot('  ------(xy)------------|', { x: x, y: y });
      const expected = '--------a---b---c-----|';
      expectObservable(e1[exhaustMap]((value) => value)).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
    });
  });
  it('should handle a hot observable of observables, one inner throws', async () => {
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const x = observable('        --a---#                ');
      const xsubs = '   ------^-----!                ';
      const y = observable('                ---d--e---f---|');
      const ysubs = [];
      const e1 = hot('  ------x-------y------|       ', { x: x, y: y });
      const expected = '--------a---#                ';
      expectObservable(e1[exhaustMap]((value) => value)).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
    });
  });
  it('should handle a hot observable of observables, outer throws', async () => {
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const x = observable('        --a---b---c--|         ');
      const xsubs = '   ------^------------!         ';
      const y = observable('                ---d--e---f---|');
      const ysubs = [];
      const e1 = hot('  ------x-------y-------#      ', { x: x, y: y });
      const expected = '--------a---b---c-----#      ';
      expectObservable(e1[exhaustMap]((value) => value)).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
    });
  });
  it('should handle an empty hot observable', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ------|');
      const e1subs = '  ^-----!';
      const expected = '------|';
      expectObservable(e1[exhaustMap]((value) => value)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should handle a never hot observable', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -');
      const e1subs = '^!';
      const expected = '-';
      expectObservable(
        e1[exhaustMap]((value) => value),
        '^!'
      ).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should complete not before the outer completes', async () => {
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const x = observable('        --a---b---c--|   ');
      const xsubs = '   ------^------------!   ';
      const e1 = hot('  ------x---------------|', { x: x });
      const expected = '--------a---b---c-----|';
      expectObservable(e1[exhaustMap]((value) => value)).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
    });
  });
});
