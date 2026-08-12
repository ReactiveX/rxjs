// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/onErrorResumeNext-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { onErrorResumeNext } from 'rxjs/on-error-resume-next';
describe('onErrorResumeNext (platform)', () => {
  it('should continue observable sequence with next observable', async () => {
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--#        ');
      const e1subs = '  ^-------!        ';
      const e2 = observable('         --c--d--|');
      const e2subs = '  --------^-------!';
      const expected = '--a--b----c--d--|';
      expectObservable(e1[onErrorResumeNext]([e2])).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should continue with hot observables', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--#        ');
      const e1subs = '  ^-------!        ';
      const e2 = hot('  -----x----c--d--|');
      const e2subs = '  --------^-------!';
      const expected = '--a--b----c--d--|';
      expectObservable(e1[onErrorResumeNext]([e2])).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should continue with array of multiple observables that throw errors', async () => {
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--#                     ');
      const e1subs = '  ^-------!                     ';
      const e2 = [
        observable('                  --c--d--#             '),
        observable('                          --e--#        '),
        observable('                               --f--g--|'),
      ];
      const e2subs = [
        '               --------^-------!',
        '               ----------------^----!',
        '               ---------------------^-------!',
      ];
      const expected = '--a--b----c--d----e----f--g--|';
      expectObservable(e1[onErrorResumeNext](e2)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2[0].subscriptions).toBe(e2subs[0]);
      expectSubscriptions(e2[1].subscriptions).toBe(e2subs[1]);
      expectSubscriptions(e2[2].subscriptions).toBe(e2subs[2]);
    });
  });
  it('should continue with multiple observables that throw errors', async () => {
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--#                     ');
      const e1subs = '  ^-------!                     ';
      const e2 = observable('         --c--d--#             ');
      const e2subs = '  --------^-------!             ';
      const e3 = observable('                 --e--#        ');
      const e3subs = '  ----------------^----!        ';
      const e4 = observable('                      --f--g--|');
      const e4subs = '  ---------------------^-------!';
      const expected = '--a--b----c--d----e----f--g--|';
      expectObservable(e1[onErrorResumeNext]([e2, e3, e4])).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
      expectSubscriptions(e3.subscriptions).toBe(e3subs);
      expectSubscriptions(e4.subscriptions).toBe(e4subs);
    });
  });
  it("should continue with multiple observables that don't throw error", async () => {
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--|                     ');
      const e1subs = '  ^-------!                     ';
      const e2 = observable('         --c--d--|             ');
      const e2subs = '  --------^-------!             ';
      const e3 = observable('                 --e--|        ');
      const e3subs = '  ----------------^----!        ';
      const e4 = observable('                      --f--g--|');
      const e4subs = '  ---------------------^-------!';
      const expected = '--a--b----c--d----e----f--g--|';
      expectObservable(e1[onErrorResumeNext]([e2, e3, e4])).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
      expectSubscriptions(e3.subscriptions).toBe(e3subs);
      expectSubscriptions(e4.subscriptions).toBe(e4subs);
    });
  });
  it('should continue after empty observable', async () => {
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  |                     ');
      const e1subs = '  (^!)                  ';
      const e2 = observable(' --c--d--|             ');
      const e2subs = '  ^-------!             ';
      const e3 = observable('         --e--#        ');
      const e3subs = '  --------^----!        ';
      const e4 = observable('              --f--g--|');
      const e4subs = '  -------------^-------!';
      const expected = '--c--d----e----f--g--|';
      expectObservable(e1[onErrorResumeNext]([e2, e3, e4])).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
      expectSubscriptions(e3.subscriptions).toBe(e3subs);
      expectSubscriptions(e4.subscriptions).toBe(e4subs);
    });
  });
  it('should not complete with observable that does not complete', async () => {
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--| ');
      const e1subs = '  ^-------! ';
      const e2 = observable('         --');
      const e2subs = '--------^-!';
      const expected = '--a--b----';
      expectObservable(e1[onErrorResumeNext]([e2]), '^---------!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should not continue when source observable does not complete', async () => {
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--');
      const e1subs = '^----!';
      const e2 = observable('-b--c-');
      const e2subs = [];
      const expected = '--a--';
      expectObservable(e1[onErrorResumeNext]([e2]), '^----!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should complete observable when next observable throws', async () => {
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--#        ');
      const e1subs = '  ^-------!        ';
      const e2 = observable('         --c--d--#');
      const e2subs = '  --------^-------!';
      const expected = '--a--b----c--d--|';
      expectObservable(e1[onErrorResumeNext]([e2])).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should unsubscribe from an interop observable upon explicit unsubscription', async () => {
    const asInteropObservable = (source) =>
      new Proxy(source, {
        get(target, key) {
          if (key === 'subscribe') {
            return (...args) => Reflect.apply(target.subscribe, target, args);
          }
          return Reflect.get(target, key, target);
        },
        getPrototypeOf(target) {
          const prototype = Reflect.getPrototypeOf(target);
          return { ...prototype, subscribe: (...args) => Reflect.apply(target.subscribe, target, args) };
        },
      });
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--#       ');
      const e1subs = '  ^-------!       ';
      const e2 = observable('         --c--d--');
      const e2subs = '  --------^---!   ';
      const unsub = '   ------------!   ';
      const expected = '--a--b----c--   ';
      // This test manipulates the observable to make it look like an interop
      // observable - an observable from a foreign library. Interop subscribers
      // are treated differently: they are wrapped in a safe subscriber. This
      // test ensures that unsubscriptions are chained all the way to the
      // interop subscriber.
      expectObservable(e1[onErrorResumeNext]([asInteropObservable(e2)]), unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
});
