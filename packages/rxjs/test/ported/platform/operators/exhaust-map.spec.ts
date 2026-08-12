// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/exhaustMap-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { exhaustMap } from 'rxjs/exhaust-map';
import { map } from 'rxjs/map';
import { mergeMap } from 'rxjs/merge-map';
describe('exhaustMap (platform)', () => {
  it('should map-and-flatten each item to an Observable', async () => {
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const values = { x: 10, y: 30, z: 50 };
      const e1 = hot('   --1-----3--5-------|');
      const e1subs = '   ^------------------!';
      const e2 = observable('    x-x-x|            ', values);
      //                         x-x-x|
      //                            x-x-x|
      const expected = ' --x-x-x-y-y-y------|';
      const result = e1[exhaustMap]((x) => e2[map]((i) => i * +x));
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should handle outer throw', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const x = observable('  --a--b--c--|');
      const xsubs = [];
      const e1 = observable(' #   ');
      const e1subs = '  (^!)';
      const expected = '#   ';
      const result = e1[exhaustMap](() => x);
      expectObservable(result).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should handle outer empty', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const x = observable('  --a--b--c--|');
      const xsubs = [];
      const e1 = observable(' |   ');
      const e1subs = '  (^!)';
      const expected = '|   ';
      const result = e1[exhaustMap](() => x);
      expectObservable(result).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should handle outer never', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const x = observable('  --a--b--c--|');
      const xsubs = [];
      const e1 = observable(' -');
      const e1subs = '^!';
      const expected = '-';
      const result = e1[exhaustMap](() => x);
      expectObservable(result, '^!').toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should raise error if project throws', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ---x---------y-----------------z-------------|');
      const e1subs = '  ^--!';
      const expected = '---#';
      const result = e1[exhaustMap](() => {
        throw 'error';
      });
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should switch with a selector function', async () => {
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const x = observable('     --a--b--c--|                               ');
      const xsubs = '   ---^----------!                               ';
      const y = observable('               --d--e--f--|                     ');
      const ysubs = [];
      const z = observable('                                 --g--h--i--|   ');
      const zsubs = '   -------------------------------^----------!   ';
      const e1 = hot('  ---x---------y-----------------z-------------|');
      const e1subs = '  ^--------------------------------------------!';
      const expected = '-----a--b--c---------------------g--h--i-----|';
      const observableLookup = { x: x, y: y, z: z };
      const result = e1[exhaustMap]((value) => observableLookup[value]);
      expectObservable(result).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(z.subscriptions).toBe(zsubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should switch inner cold observables, outer is unsubscribed early', async () => {
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const x = observable('     --a--b--c--|                               ');
      const xsubs = '   ---^----------!                               ';
      const y = observable('               --d--e--f--|                     ');
      const ysubs = [];
      const z = observable('                                 --g--h--i--|   ');
      const zsubs = '   -------------------------------^--!           ';
      const e1 = hot('  ---x---------y-----------------z-------------|');
      const unsub = '   ----------------------------------!           ';
      const e1subs = '  ^---------------------------------!           ';
      const expected = '-----a--b--c---------------------g-           ';
      const observableLookup = { x: x, y: y, z: z };
      const result = e1[exhaustMap]((value) => observableLookup[value]);
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(z.subscriptions).toBe(zsubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not break unsubscription chains when result is unsubscribed explicitly', async () => {
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const x = observable('     --a--b--c--|                               ');
      const xsubs = '   ---^----------!                               ';
      const y = observable('               --d--e--f--|                     ');
      const ysubs = [];
      const z = observable('                                 --g--h--i--|   ');
      const zsubs = '   -------------------------------^--!           ';
      const e1 = hot('  ---x---------y-----------------z-------------|');
      const e1subs = '  ^---------------------------------!           ';
      const expected = '-----a--b--c---------------------g-           ';
      const unsub = '   ----------------------------------!           ';
      const observableLookup = { x: x, y: y, z: z };
      const result = e1[mergeMap]((x) => Observable.from([x]))
        [exhaustMap]((value) => observableLookup[value])
        [mergeMap]((x) => Observable.from([x]));
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(z.subscriptions).toBe(zsubs);
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
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const x = observable('     --a--b--c--|                               ');
      const xsubs = '   ---^----------!                               ';
      const y = observable('               --d--e--f--|                     ');
      const ysubs = [];
      const z = observable('                                 --g--h--i--|   ');
      const zsubs = '   -------------------------------^--!           ';
      const e1 = hot('  ---x---------y-----------------z-------------|');
      const e1subs = '  ^---------------------------------!           ';
      const expected = '-----a--b--c---------------------g-           ';
      const unsub = '   ----------------------------------!           ';
      const observableLookup = { x: x, y: y, z: z };
      // This test is the same as the previous test, but the observable is
      // manipulated to make it look like an interop observable - an observable
      // from a foreign library. Interop subscribers are treated differently:
      // they are wrapped in a safe subscriber. This test ensures that
      // unsubscriptions are chained all the way to the interop subscriber.
      const result = e1[mergeMap]((x) => Observable.from([x]))
        [exhaustMap]((value) => asInteropObservable(observableLookup[value]))
        [mergeMap]((x) => Observable.from([x]));
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(z.subscriptions).toBe(zsubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should switch inner cold observables, inner never completes', async () => {
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const x = observable('     --a--b--c--|                              ');
      const xsubs = '   ---^----------!                              ';
      const y = observable('               --d--e--f--|                    ');
      const ysubs = [];
      const z = observable('                                 --g--h--i-----');
      const zsubs = '-------------------------------^-------------!';
      const e1 = hot('  ---x---------y-----------------z---------|   ');
      const e1subs = '  ^----------------------------------------!   ';
      const expected = '-----a--b--c---------------------g--h--i-----';
      const observableLookup = { x: x, y: y, z: z };
      const result = e1[exhaustMap]((value) => observableLookup[value]);
      expectObservable(result, '^--------------------------------------------!').toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(z.subscriptions).toBe(zsubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should handle a synchronous switch and stay on the first inner observable', async () => {
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const x = observable('           --a--b--c--d--e--|   ');
      const xsubs = '   ---------^----------------!   ';
      const y = observable('           ---f---g---h---i--|  ');
      const ysubs = [];
      const e1 = hot('  ---------(xy)----------------|');
      const e1subs = '  ^----------------------------!';
      const expected = '-----------a--b--c--d--e-----|';
      const observableLookup = { x: x, y: y };
      const result = e1[exhaustMap]((value) => observableLookup[value]);
      expectObservable(result).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should switch inner cold observables, one inner throws', async () => {
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const x = observable('           --a--b--c--d--#             ');
      const xsubs = '   ---------^-------------!             ';
      const y = observable('                     ---f---g---h---i--');
      const ysubs = [];
      const e1 = hot('  ---------x---------y---------|       ');
      const e1subs = '  ^----------------------!             ';
      const expected = '-----------a--b--c--d--#             ';
      const observableLookup = { x: x, y: y };
      const result = e1[exhaustMap]((value) => observableLookup[value]);
      expectObservable(result).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should switch inner hot observables', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const x = hot('   -----a--b--c--d--e--|                  ');
      const xsubs = '   ---------^----------!                  ';
      const y = hot('   --p-o-o-p-------f---g---h---i--|       ');
      const ysubs = [];
      const z = hot('   ---z-o-o-m-------------j---k---l---m--|');
      const zsubs = '   --------------------^-----------------!';
      const e1 = hot('  ---------x----y-----z--------|         ');
      const e1subs = '  ^----------------------------!         ';
      const expected = '-----------c--d--e-----j---k---l---m--|';
      const observableLookup = { x: x, y: y, z: z };
      const result = e1[exhaustMap]((value) => observableLookup[value]);
      expectObservable(result).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(z.subscriptions).toBe(zsubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should switch inner empty and empty', async () => {
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const x = observable('           |                    ');
      const y = observable('                     |          ');
      const xsubs = '   ---------(^!)                 ';
      const ysubs = '   -------------------(^!)       ';
      const e1 = hot('  ---------x---------y---------|');
      const e1subs = '  ^----------------------------!';
      const expected = '-----------------------------|';
      const observableLookup = { x: x, y: y };
      const result = e1[exhaustMap]((value) => observableLookup[value]);
      expectObservable(result).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should switch inner empty and never', async () => {
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const x = observable('           |                    ');
      const xsubs = '   ---------(^!)                 ';
      const y = observable('                     -          ');
      const ysubs = '-------------------^----------!';
      const e1 = hot('  ---------x---------y---------|');
      const e1subs = '  ^----------------------------!';
      const expected = '------------------------------';
      const observableLookup = { x: x, y: y };
      const result = e1[exhaustMap]((value) => observableLookup[value]);
      expectObservable(result, '^-----------------------------!').toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should never switch inner never', async () => {
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const x = observable('           -                     ');
      const xsubs = '---------^---------------------!';
      const y = observable('                     #           ');
      const ysubs = [];
      const e1 = hot('  ---------x---------y----------|');
      const e1subs = '  ^-----------------------------!';
      const expected = '-------------------------------';
      const observableLookup = { x: x, y: y };
      const result = e1[exhaustMap]((value) => observableLookup[value]);
      expectObservable(result, '^------------------------------!').toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should switch inner empty and throw', async () => {
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const x = observable('           |                    ');
      const xsubs = '   ---------(^!)                 ';
      const y = observable('                     #          ');
      const ysubs = '   -------------------(^!)       ';
      const e1 = hot('  ---------x---------y---------|');
      const e1subs = '  ^------------------!          ';
      const expected = '-------------------#          ';
      const observableLookup = { x: x, y: y };
      const result = e1[exhaustMap]((value) => observableLookup[value]);
      expectObservable(result).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should handle outer error', async () => {
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const x = observable('           --a--b--c--d--e--|');
      const xsubs = '   ---------^---------!       ';
      const e1 = hot('  ---------x---------#       ');
      const e1subs = '  ^------------------!       ';
      const expected = '-----------a--b--c-#       ';
      const observableLookup = { x: x };
      const result = e1[exhaustMap]((value) => observableLookup[value]);
      expectObservable(result).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
});
