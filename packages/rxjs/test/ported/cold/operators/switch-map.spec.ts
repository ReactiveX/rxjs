// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/switchMap-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { ColdObservable } from 'rxjs/cold-observable';
import { map } from 'rxjs/map';
import { mergeMap } from 'rxjs/merge-map';
import { switchMap } from 'rxjs/switch-map';
describe('switchMap (cold)', () => {
  it('should map-and-flatten each item to an Observable', async () => {
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const e1 = hot('   --1-----3--5-------|');
      const e1subs = '   ^------------------!';
      const e2 = cold('    x-x-x|            ', { x: 10 });
      //                         x-x-x|
      //                            x-x-x|
      const expected = ' --x-x-x-y-yz-z-z---|';
      const values = { x: 10, y: 30, z: 50 };
      const result = e1[switchMap]((x) => e2[map]((i) => i * +x));
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should switch inner cold observables', async () => {
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const x = cold('           --a--b--c--d--e--|           ');
      const xsubs = '   ---------^---------!                  ';
      const y = cold('                     ---f---g---h---i--|');
      const ysubs = '   -------------------^-----------------!';
      const e1 = hot('  ---------x---------y---------|        ');
      const e1subs = '  ^----------------------------!        ';
      const expected = '-----------a--b--c----f---g---h---i--|';
      const observableLookup = { x: x, y: y };
      const result = e1[switchMap]((value) => observableLookup[value]);
      expectObservable(result).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should raise error when projection throws', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -------x-----y---|');
      const e1subs = '  ^------!          ';
      const expected = '-------#          ';
      function project() {
        throw 'error';
      }
      expectObservable(e1[switchMap](project)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should switch inner cold observables, outer is unsubscribed early', async () => {
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const x = cold('           --a--b--c--d--e--|           ');
      const xsubs = '   ---------^---------!                  ';
      const y = cold('                     ---f---g---h---i--|');
      const ysubs = '   -------------------^-!                ';
      const e1 = hot('  ---------x---------y---------|        ');
      const e1subs = '  ^--------------------!                ';
      const unsub = '   ---------------------!                ';
      const expected = '-----------a--b--c----                ';
      const observableLookup = { x: x, y: y };
      const result = e1[switchMap]((value) => observableLookup[value]);
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not break unsubscription chains when result is unsubscribed explicitly', async () => {
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const x = cold('           --a--b--c--d--e--|           ');
      const xsubs = '   ---------^---------!                  ';
      const y = cold('                     ---f---g---h---i--|');
      const ysubs = '   -------------------^-!                ';
      const e1 = hot('  ---------x---------y---------|        ');
      const e1subs = '  ^--------------------!                ';
      const expected = '-----------a--b--c----                ';
      const unsub = '   ---------------------!                ';
      const observableLookup = { x: x, y: y };
      const result = e1[mergeMap]((x) => ColdObservable.from([x]))
        [switchMap]((value) => observableLookup[value])
        [mergeMap]((x) => ColdObservable.from([x]));
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not break unsubscription chains with interop inners when result is unsubscribed explicitly', async () => {
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
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const x = cold('           --a--b--c--d--e--|           ');
      const xsubs = '   ---------^---------!                  ';
      const y = cold('                     ---f---g---h---i--|');
      const ysubs = '   -------------------^-!                ';
      const e1 = hot('  ---------x---------y---------|        ');
      const e1subs = '  ^--------------------!                ';
      const expected = '-----------a--b--c----                ';
      const unsub = '   ---------------------!                ';
      const observableLookup = { x: x, y: y };
      // This test is the same as the previous test, but the observable is
      // manipulated to make it look like an interop observable - an observable
      // from a foreign library. Interop subscribers are treated differently:
      // they are wrapped in a safe subscriber. This test ensures that
      // unsubscriptions are chained all the way to the interop subscriber.
      const result = e1[mergeMap]((x) => ColdObservable.from([x]))
        [switchMap]((value) => asInteropObservable(observableLookup[value]))
        [mergeMap]((x) => ColdObservable.from([x]));
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should switch inner cold observables, inner never completes', async () => {
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const x = cold('           --a--b--c--d--e--|          ');
      const xsubs = '   ---------^---------!                 ';
      const y = cold('                     ---f---g---h---i--');
      const ysubs = '-------------------^-----------------!';
      const e1 = hot('  ---------x---------y---------|       ');
      const e1subs = '  ^----------------------------!       ';
      const expected = '-----------a--b--c----f---g---h---i--';
      const observableLookup = { x: x, y: y };
      const result = e1[switchMap]((value) => observableLookup[value]);
      expectObservable(result, '^------------------------------------!').toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should handle a synchronous switch to the second inner observable', async () => {
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const x = cold('           --a--b--c--d--e--|   ');
      const xsubs = '   ---------(^!)                 ';
      const y = cold('           ---f---g---h---i--|  ');
      const ysubs = '   ---------^-----------------!  ';
      const e1 = hot('  ---------(xy)----------------|');
      const e1subs = '  ^----------------------------!';
      const expected = '------------f---g---h---i----|';
      const observableLookup = { x: x, y: y };
      const result = e1[switchMap]((value) => observableLookup[value]);
      expectObservable(result).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should switch inner cold observables, one inner throws', async () => {
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const x = cold('           --a--b--#--d--e--|          ');
      const xsubs = '   ---------^-------!                   ';
      const y = cold('                     ---f---g---h---i--');
      const ysubs = '                                        ';
      const e1 = hot('  ---------x---------y---------|       ');
      const e1subs = '  ^----------------!                   ';
      const expected = '-----------a--b--#                   ';
      const observableLookup = { x: x, y: y };
      const result = e1[switchMap]((value) => observableLookup[value]);
      expectObservable(result).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should switch inner hot observables', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const x = hot('   -----a--b--c--d--e--|                 ');
      const xsubs = '   ---------^---------!                  ';
      const y = hot('   --p-o-o-p-------------f---g---h---i--|');
      const ysubs = '   -------------------^-----------------!';
      const e1 = hot('  ---------x---------y---------|        ');
      const e1subs = '  ^----------------------------!        ';
      const expected = '-----------c--d--e----f---g---h---i--|';
      const observableLookup = { x: x, y: y };
      const result = e1[switchMap]((value) => observableLookup[value]);
      expectObservable(result).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should switch inner empty and empty', async () => {
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const x = cold('           |                    ');
      const y = cold('                     |          ');
      const xsubs = '   ---------(^!)                 ';
      const ysubs = '   -------------------(^!)       ';
      const e1 = hot('  ---------x---------y---------|');
      const e1subs = '  ^----------------------------!';
      const expected = '-----------------------------|';
      const observableLookup = { x: x, y: y };
      const result = e1[switchMap]((value) => observableLookup[value]);
      expectObservable(result).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should switch inner empty and never', async () => {
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const x = cold('           |                    ');
      const y = cold('                     -          ');
      const xsubs = '   ---------(^!)                 ';
      const ysubs = '-------------------^----------!';
      const e1 = hot('  ---------x---------y---------|');
      const e1subs = '  ^----------------------------!';
      const expected = '------------------------------';
      const observableLookup = { x: x, y: y };
      const result = e1[switchMap]((value) => observableLookup[value]);
      expectObservable(result, '^-----------------------------!').toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should switch inner never and empty', async () => {
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const x = cold('           -                    ');
      const y = cold('                     |          ');
      const xsubs = '   ---------^---------!          ';
      const ysubs = '   -------------------(^!)       ';
      const e1 = hot('  ---------x---------y---------|');
      const e1subs = '  ^----------------------------!';
      const expected = '-----------------------------|';
      const observableLookup = { x: x, y: y };
      const result = e1[switchMap]((value) => observableLookup[value]);
      expectObservable(result).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should switch inner never and throw', async () => {
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const x = cold('           -                    ');
      const y = cold('                     #          ', undefined, 'sad');
      const xsubs = '   ---------^---------!          ';
      const ysubs = '   -------------------(^!)       ';
      const e1 = hot('  ---------x---------y---------|');
      const e1subs = '  ^------------------!          ';
      const expected = '-------------------#          ';
      const observableLookup = { x: x, y: y };
      const result = e1[switchMap]((value) => observableLookup[value]);
      expectObservable(result).toBe(expected, undefined, 'sad');
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should switch inner empty and throw', async () => {
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const x = cold('           |                    ');
      const y = cold('                     #          ', undefined, 'sad');
      const xsubs = '   ---------(^!)                 ';
      const ysubs = '   -------------------(^!)       ';
      const e1 = hot('  ---------x---------y---------|');
      const e1subs = '  ^------------------!          ';
      const expected = '-------------------#          ';
      const observableLookup = { x: x, y: y };
      const result = e1[switchMap]((value) => observableLookup[value]);
      expectObservable(result).toBe(expected, undefined, 'sad');
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should handle outer empty', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' |   ');
      const e1subs = '  (^!)';
      const expected = '|   ';
      const result = e1[switchMap]((value) => ColdObservable.from([value]));
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should handle outer never', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' -');
      const e1subs = '^!';
      const expected = '-';
      const result = e1[switchMap]((value) => ColdObservable.from([value]));
      expectObservable(result, '^!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should handle outer throw', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' #   ');
      const e1subs = '  (^!)';
      const expected = '#   ';
      const result = e1[switchMap]((value) => ColdObservable.from([value]));
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should handle outer error', async () => {
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const x = cold('           --a--b--c--d--e--|');
      const xsubs = '   ---------^---------!       ';
      const e1 = hot('  ---------x---------#       ');
      const e1subs = '  ^------------------!       ';
      const expected = '-----------a--b--c-#       ';
      const observableLookup = { x: x };
      const result = e1[switchMap]((value) => observableLookup[value]);
      expectObservable(result).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
});
