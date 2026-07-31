// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/catchError-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { catchError } from 'rxjs/catch-error';
import { concat } from 'rxjs/concat';
import { map } from 'rxjs/map';
import { mergeMap } from 'rxjs/merge-map';
describe('catchError (platform)', () => {
  it('should catch error and replace with a cold Observable', async () => {
    await rxTest(({ hot, observable, expectObservable }) => {
      const e1 = hot('  --a--b--#       ');
      const e2 = observable('         -1-2-3-|');
      const expected = '--a--b---1-2-3-|';
      const result = e1[catchError]((err) => e2);
      expectObservable(result).toBe(expected);
    });
  });
  it('should catch error and replace it with Observable.of()', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--------|');
      const subs = '    ^-------!';
      const expected = '--a--b--(XYZ|)';
      const result = e1[map]((n) => {
        if (n === 'c') {
          throw 'bad';
        }
        return n;
      })[catchError]((err) => {
        return Observable.from(['X', 'Y', 'Z']);
      });
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(subs);
    });
  });
  it('should catch error and replace it with a cold Observable', async () => {
    await rxTest(({ hot, observable, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--#          ');
      const e1subs = '  ^-------!          ';
      const e2 = observable('         1-2-3-4-5-|');
      const e2subs = '  --------^---------!';
      const expected = '--a--b--1-2-3-4-5-|';
      const result = e1[catchError]((err) => e2);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should allow unsubscribing explicitly and early', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --1-2-3-4-5-6---#');
      const e1subs = '  ^------!         ';
      const expected = '--1-2-3-         ';
      const unsub = '   -------!         ';
      const result = e1[catchError](() => {
        return Observable.from(['X', 'Y', 'Z']);
      });
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not break unsubscription chain when unsubscribed explicitly', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --1-2-3-4-5-6---#');
      const e1subs = '  ^------!         ';
      const expected = '--1-2-3-         ';
      const unsub = '   -------!         ';
      const result = e1[mergeMap]((x) => Observable.from([x]))
        [catchError](() => {
          return Observable.from(['X', 'Y', 'Z']);
        })
        [mergeMap]((x) => Observable.from([x]));
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should unsubscribe from a caught hot caught observable when unsubscribed explicitly', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -1-2-3-#          ');
      const e1subs = '  ^------!          ';
      const e2 = hot('  ---3-4-5-6-7-8-9-|');
      const e2subs = '  -------^----!     ';
      const expected = '-1-2-3-5-6-7-     ';
      const unsub = '   ------------!     ';
      const result = e1[catchError](() => e2);
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should unsubscribe from a caught cold caught observable when unsubscribed explicitly', async () => {
    await rxTest(({ hot, observable, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -1-2-3-#          ');
      const e1subs = '  ^------!          ';
      const e2 = observable('        5-6-7-8-9-|');
      const e2subs = '  -------^----!     ';
      const expected = '-1-2-3-5-6-7-     ';
      const unsub = '   ------------!     ';
      const result = e1[catchError](() => e2);
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should unsubscribe from a caught cold caught interop observable when unsubscribed explicitly', async () => {
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
    await rxTest(({ hot, observable, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -1-2-3-#          ');
      const e1subs = '  ^------!          ';
      const e2 = observable('        5-6-7-8-9-|');
      const e2subs = '  -------^----!     ';
      const expected = '-1-2-3-5-6-7-     ';
      const unsub = '   ------------!     ';
      // This test is the same as the previous test, but the observable is
      // manipulated to make it look like an interop observable - an observable
      // from a foreign library. Interop subscribers are treated differently:
      // they are wrapped in a safe subscriber. This test ensures that
      // unsubscriptions are chained all the way to the interop subscriber.
      const result = e1[catchError](() => asInteropObservable(e2));
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should catch error and replace it with a hot Observable', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--#          ');
      const e1subs = '  ^-------!          ';
      const e2 = hot('  1-2-3-4-5-6-7-8-9-|');
      const e2subs = '  --------^---------!';
      const expected = '--a--b--5-6-7-8-9-|';
      const result = e1[catchError]((err) => e2);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should catch and allow the cold observable to be repeated with the third (caught) argument', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable('--a--b--c--------|       ');
      const subs = [
        '               ^-------!                ',
        '              --------^-------!         ',
        '              ----------------^-------! ',
      ];
      const expected = '--a--b----a--b----a--b--#';
      let retries = 0;
      const result = e1[map]((n) => {
        if (n === 'c') {
          throw 'bad';
        }
        return n;
      })[catchError]((err, caught) => {
        if (retries++ === 2) {
          throw 'done';
        }
        return caught;
      });
      expectObservable(result).toBe(expected, undefined, 'done');
      expectSubscriptions(e1.subscriptions).toBe(subs);
    });
  });
  it('should catch and allow the hot observable to proceed with the third (caught) argument', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c----d---|');
      // prettier-ignore
      const subs = [
                '               ^-------!         ',
                '              --------^--------! ',
            ];
      const expected = '--a--b-------d---|';
      let retries = 0;
      const result = e1[map]((n) => {
        if (n === 'c') {
          throw 'bad';
        }
        return n;
      })[catchError]((err, caught) => {
        if (retries++ === 2) {
          throw 'done';
        }
        return caught;
      });
      expectObservable(result).toBe(expected, undefined, 'done');
      expectSubscriptions(e1.subscriptions).toBe(subs);
    });
  });
  it('should catch and replace a Observable.throw() as the source', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' #');
      const subs = '    (^!)';
      const expected = '(abc|)';
      const result = e1[catchError]((err) => Observable.from(['a', 'b', 'c']));
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(subs);
    });
  });
  it('should mirror the source if it does not raise errors', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' --a--b--c--|');
      const subs = '    ^----------!';
      const expected = '--a--b--c--|';
      const result = e1[catchError]((err) => Observable.from(['x', 'y', 'z']));
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(subs);
    });
  });
  it('should complete if you return Observable.empty()', async () => {
    await rxTest(({ hot, observable, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--#');
      const e1subs = '  ^-------!';
      const e2 = observable('         |');
      const e2subs = '  --------(^!)';
      const expected = '--a--b--|';
      const result = e1[catchError](() => e2);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should raise error if you return Observable.throw()', async () => {
    await rxTest(({ hot, observable, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--#');
      const e1subs = '  ^-------!';
      const e2 = observable('         #');
      const e2subs = '  --------(^!)';
      const expected = '--a--b--#';
      const result = e1[catchError](() => e2);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should never terminate if you return NEVER', async () => {
    await rxTest(({ hot, observable, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--#');
      const e1subs = '  ^-------!';
      const e2 = observable('         -');
      const e2subs = '--------^!';
      const expected = '--a--b---';
      const result = e1[catchError](() => e2);
      expectObservable(result, '^--------!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should catch errors throw from within the constructor', async () => {
    await rxTest(({ expectObservable }) => {
      const source = Observable[concat]([
        new Observable((o) => {
          o.next('a');
          throw 'kaboom';
        })[catchError]((_) => Observable.from(['b'])),
        Observable.from(['c']),
      ]);
      const expected = '(abc|)';
      expectObservable(source).toBe(expected);
    });
  });
});
