// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/switchScan-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { map } from 'rxjs/map';
import { mergeMap } from 'rxjs/merge-map';
import { switchScan } from 'rxjs/switch-scan';
describe('switchScan (platform)', () => {
  it('should map-and-flatten each item to an Observable while passing the accumulated value', async () => {
    await rxTest(({ hot, observable, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --1-----3--5-------|');
      const e1subs = '  ^------------------!';
      const e2 = observable('    x-x-x|           ', { x: 10 });
      //                        x-x-x|
      //                           x-x-x|
      const expected = '--x-x-x-y-yz-z-z---|';
      const values = { x: 10, y: 40, z: 90 };
      const result = e1[switchScan]((acc, x) => e2[map]((i) => i * Number(x) + acc), 0);
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should switch inner cold observables', async () => {
    await rxTest(({ hot, observable, expectObservable, expectSubscriptions }) => {
      const x = observable('           --a--b--c--d--e--|           ');
      const xsubs = '   ---------^---------!                  ';
      const y = observable('                     ---f---g---h---i--|');
      const ysubs = '   -------------------^-----------------!';
      const e1 = hot('  ---------x---------y---------|        ');
      const e1subs = '  ^----------------------------!        ';
      const expected = '-----------a--b--c----f---g---h---i--|';
      const observableLookup = { x, y };
      const result = e1[switchScan]((_acc, value) => observableLookup[value], null);
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
      expectObservable(e1[switchScan](project, null)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should switch inner cold observables, outer is unsubscribed early', async () => {
    await rxTest(({ hot, observable, expectObservable, expectSubscriptions }) => {
      const x = observable('           --a--b--c--d--e--|           ');
      const xsubs = '   ---------^---------!                  ';
      const y = observable('                     ---f---g---h---i--|');
      const ysubs = '   -------------------^-!                ';
      const e1 = hot('  ---------x---------y---------|        ');
      const e1subs = '  ^--------------------!                ';
      const unsub = '   ---------------------!                ';
      const expected = '-----------a--b--c----                ';
      const observableLookup = { x, y };
      const result = e1[switchScan]((_acc, value) => observableLookup[value], null);
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not break unsubscription chains when result is unsubscribed explicitly', async () => {
    await rxTest(({ hot, observable, expectObservable, expectSubscriptions }) => {
      const x = observable('           --a--b--c--d--e--|           ');
      const xsubs = '   ---------^---------!                  ';
      const y = observable('                     ---f---g---h---i--|');
      const ysubs = '   -------------------^-!                ';
      const e1 = hot('  ---------x---------y---------|        ');
      const e1subs = '  ^--------------------!                ';
      const expected = '-----------a--b--c----                ';
      const unsub = '   ---------------------!                ';
      const observableLookup = { x, y };
      const result = e1[mergeMap]((x) => Observable.from([x]))
        [switchScan]((_acc, value) => observableLookup[value], null)
        [mergeMap]((x) => Observable.from([x]));
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should switch inner cold observables, inner never completes', async () => {
    await rxTest(({ hot, observable, expectObservable, expectSubscriptions }) => {
      const x = observable('           --a--b--c--d--e--|          ');
      const xsubs = '   ---------^---------!                 ';
      const y = observable('                     ---f---g---h---i--');
      const ysubs = '-------------------^-----------------!';
      const e1 = hot('  ---------x---------y---------|       ');
      const e1subs = '  ^----------------------------!       ';
      const expected = '-----------a--b--c----f---g---h---i--';
      const observableLookup = { x, y };
      const result = e1[switchScan]((_acc, value) => observableLookup[value], null);
      expectObservable(result, '^------------------------------------!').toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should handle a synchronous switch to the second inner observable', async () => {
    await rxTest(({ hot, observable, expectObservable, expectSubscriptions }) => {
      const x = observable('           --a--b--c--d--e--|   ');
      const xsubs = '   ---------(^!)                 ';
      const y = observable('           ---f---g---h---i--|  ');
      const ysubs = '   ---------^-----------------!  ';
      const e1 = hot('  ---------(xy)----------------|');
      const e1subs = '  ^----------------------------!';
      const expected = '------------f---g---h---i----|';
      const observableLookup = { x, y };
      const result = e1[switchScan]((_acc, value) => observableLookup[value], null);
      expectObservable(result).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should switch inner cold observables, one inner throws', async () => {
    await rxTest(({ hot, observable, expectObservable, expectSubscriptions }) => {
      const x = observable('           --a--b--#--d--e--|          ');
      const xsubs = '   ---------^-------!                   ';
      const y = observable('                     ---f---g---h---i--');
      const ysubs = '                                        ';
      const e1 = hot('  ---------x---------y---------|       ');
      const e1subs = '  ^----------------!                   ';
      const expected = '-----------a--b--#                   ';
      const observableLookup = { x, y };
      const result = e1[switchScan]((_acc, value) => observableLookup[value], null);
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
      const observableLookup = { x, y };
      const result = e1[switchScan]((_acc, value) => observableLookup[value], null);
      expectObservable(result).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should switch inner empty and empty', async () => {
    await rxTest(({ hot, observable, expectObservable, expectSubscriptions }) => {
      const x = observable('           |                    ');
      const y = observable('                     |          ');
      const xsubs = '   ---------(^!)                 ';
      const ysubs = '   -------------------(^!)       ';
      const e1 = hot('  ---------x---------y---------|');
      const e1subs = '  ^----------------------------!';
      const expected = '-----------------------------|';
      const observableLookup = { x, y };
      const result = e1[switchScan]((_acc, value) => observableLookup[value], null);
      expectObservable(result).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should switch inner empty and never', async () => {
    await rxTest(({ hot, observable, expectObservable, expectSubscriptions }) => {
      const x = observable('           |                    ');
      const y = observable('                     -----------');
      const xsubs = '   ---------(^!)                 ';
      const ysubs = '-------------------^----------!';
      const e1 = hot('  ---------x---------y---------|');
      const e1subs = '  ^----------------------------!';
      const expected = '------------------------------';
      const observableLookup = { x, y };
      const result = e1[switchScan]((_acc, value) => observableLookup[value], null);
      expectObservable(result, '^-----------------------------!').toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should switch inner never and empty', async () => {
    await rxTest(({ hot, observable, expectObservable, expectSubscriptions }) => {
      const x = observable('           -----------          ');
      const y = observable('                     |          ');
      const xsubs = '   ---------^---------!          ';
      const ysubs = '   -------------------(^!)       ';
      const e1 = hot('  ---------x---------y---------|');
      const e1subs = '  ^----------------------------!';
      const expected = '-----------------------------|';
      const observableLookup = { x, y };
      const result = e1[switchScan]((_acc, value) => observableLookup[value], null);
      expectObservable(result).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should switch inner never and throw', async () => {
    await rxTest(({ hot, observable, expectObservable, expectSubscriptions }) => {
      const x = observable('           -----------          ');
      const y = observable('                     #          ', undefined, 'sad');
      const xsubs = '   ---------^---------!          ';
      const ysubs = '   -------------------(^!)       ';
      const e1 = hot('  ---------x---------y---------|');
      const e1subs = '  ^------------------!          ';
      const expected = '-------------------#          ';
      const observableLookup = { x, y };
      const result = e1[switchScan]((_acc, value) => observableLookup[value], null);
      expectObservable(result).toBe(expected, undefined, 'sad');
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should switch inner empty and throw', async () => {
    await rxTest(({ hot, observable, expectObservable, expectSubscriptions }) => {
      const x = observable('           |                    ');
      const y = observable('                     #          ', undefined, 'sad');
      const xsubs = '   ---------(^!)                 ';
      const ysubs = '   -------------------(^!)       ';
      const e1 = hot('  ---------x---------y---------|');
      const e1subs = '  ^------------------!          ';
      const expected = '-------------------#          ';
      const observableLookup = { x, y };
      const result = e1[switchScan]((_acc, value) => observableLookup[value], null);
      expectObservable(result).toBe(expected, undefined, 'sad');
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should handle outer empty', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' |   ');
      const e1subs = '  (^!)';
      const expected = '|   ';
      const result = e1[switchScan]((_acc, value) => Observable.from([value]), '');
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should handle outer never', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' -');
      const e1subs = '^!';
      const expected = '-';
      const result = e1[switchScan]((_acc, value) => Observable.from([value]), '');
      expectObservable(result, '^!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should handle outer throw', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' #   ');
      const e1subs = '  (^!)';
      const expected = '#   ';
      const result = e1[switchScan]((_acc, value) => Observable.from([value]), '');
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should handle outer error', async () => {
    await rxTest(({ hot, observable, expectObservable, expectSubscriptions }) => {
      const x = observable('           --a--b--c--d--e--|');
      const xsubs = '   ---------^---------!       ';
      const e1 = hot('  ---------x---------#       ');
      const e1subs = '  ^------------------!       ';
      const expected = '-----------a--b--c-#       ';
      const observableLookup = { x: x };
      const result = e1[switchScan]((_acc, value) => observableLookup[value], null);
      expectObservable(result).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
});
