// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/switchMapTo-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { mergeMap } from 'rxjs/merge-map';
import { switchMap } from 'rxjs/switch-map';
describe('switchMapTo (platform)', () => {
  it('should map-and-flatten each item to an Observable', async () => {
    await rxTest(({ hot, observable, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --1-----3--5-------|');
      const e1subs = '  ^------------------!';
      const e2 = observable('   x-x-x|            ', { x: 10 });
      //                        x-x-x|
      //                           x-x-x|
      const expected = '--x-x-x-x-xx-x-x---|';
      const values = { x: 10 };
      const result = e1[switchMap](() => e2);
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should switch to an inner cold observable', async () => {
    await rxTest(({ hot, observable, expectObservable, expectSubscriptions }) => {
      const x = observable('           --a--b--c--d--e--|          ');
      const xsubs = [
        '               ---------^---------!                 ',
        //                                 --a--b--c--d--e--|
        '               -------------------^----------------!',
      ];
      const e1 = hot('  ---------x---------x---------|       ');
      const e1subs = '  ^----------------------------!       ';
      const expected = '-----------a--b--c---a--b--c--d--e--|';
      expectObservable(e1[switchMap](() => x)).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should switch to an inner cold observable, outer eventually throws', async () => {
    await rxTest(({ hot, observable, expectObservable, expectSubscriptions }) => {
      const x = observable('           --a--b--c--d--e--|');
      const xsubs = '   ---------^---------!       ';
      const e1 = hot('  ---------x---------#       ');
      const e1subs = '  ^------------------!       ';
      const expected = '-----------a--b--c-#       ';
      expectObservable(e1[switchMap](() => x)).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should switch to an inner cold observable, outer is unsubscribed early', async () => {
    await rxTest(({ hot, observable, expectObservable, expectSubscriptions }) => {
      const x = observable('           --a--b--c--d--e--|   ');
      const xsubs = [
        '               ---------^---------!          ',
        //                                 --a--b--c--d--e--|
        '               -------------------^--!       ',
      ];
      const e1 = hot('  ---------x---------x---------|');
      const unsub = '   ----------------------!       ';
      const e1subs = '  ^---------------------!       ';
      const expected = '-----------a--b--c---a-       ';
      expectObservable(
        e1[switchMap](() => x),
        unsub
      ).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not break unsubscription chains when result is unsubscribed explicitly', async () => {
    await rxTest(({ hot, observable, expectObservable, expectSubscriptions }) => {
      const x = observable('--a--b--c--d--e--|   ');
      const xsubs = [
        '               ---------^---------!          ',
        //                                 --a--b--c--d--e--|
        '               -------------------^--!       ',
      ];
      const e1 = hot('  ---------x---------x---------|');
      const e1subs = '  ^---------------------!       ';
      const expected = '-----------a--b--c---a-       ';
      const unsub = '   ----------------------!       ';
      const result = e1[mergeMap]((x) => Observable.from([x]))
        [switchMap](() => x)
        [mergeMap]((x) => Observable.from([x]));
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should switch to an inner cold observable, inner never completes', async () => {
    await rxTest(({ hot, observable, expectObservable, expectSubscriptions }) => {
      const x = observable('           --a--b--c--d--e-          ');
      const xsubs = ['               ---------^---------!               ', '-------------------^---------------!'];
      const e1 = hot('  ---------x---------y---------|     ');
      const e1subs = '  ^----------------------------!     ';
      const expected = '-----------a--b--c---a--b--c--d--e-';
      expectObservable(
        e1[switchMap](() => x),
        '^----------------------------------!'
      ).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should handle a synchronous switch to the inner observable', async () => {
    await rxTest(({ hot, observable, expectObservable, expectSubscriptions }) => {
      const x = observable('           --a--b--c--d--e--|   ');
      // prettier-ignore
      const xsubs = [
                '               ---------(^!)                 ',
                '               ---------^----------------!   '
            ];
      const e1 = hot('  ---------(xx)----------------|');
      const e1subs = '  ^----------------------------!';
      const expected = '-----------a--b--c--d--e-----|';
      expectObservable(e1[switchMap](() => x)).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should switch to an inner cold observable, inner raises an error', async () => {
    await rxTest(({ hot, observable, expectObservable, expectSubscriptions }) => {
      const x = observable('           --a--b--#            ');
      const xsubs = '   ---------^-------!            ';
      const e1 = hot('  ---------x---------x---------|');
      const e1subs = '  ^----------------!            ';
      const expected = '-----------a--b--#            ';
      expectObservable(e1[switchMap](() => x)).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should switch an inner hot observable', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const x = hot('   --p-o-o-p---a--b--c--d-|      ');
      // prettier-ignore
      const xsubs = [
                '               ---------^---------!          ',
                '               -------------------^---!      '
            ];
      const e1 = hot('  ---------x---------x---------|');
      const e1subs = '  ^----------------------------!';
      const expected = '------------a--b--c--d-------|';
      expectObservable(e1[switchMap](() => x)).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should switch to an inner empty', async () => {
    await rxTest(({ hot, observable, expectObservable, expectSubscriptions }) => {
      const x = observable('           |                    ');
      const xsubs = [
        '               ---------(^!)                 ',
        //                                 |
        '               -------------------(^!)       ',
      ];
      const e1 = hot('  ---------x---------x---------|');
      const e1subs = '  ^----------------------------!';
      const expected = '-----------------------------|';
      expectObservable(e1[switchMap](() => x)).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should switch to an inner never', async () => {
    await rxTest(({ hot, observable, expectObservable, expectSubscriptions }) => {
      const x = observable('           -                    ');
      const xsubs = ['               ---------^---------!          ', '-------------------^----------!'];
      const e1 = hot('  ---------x---------x---------|');
      const e1subs = '  ^----------------------------!';
      const expected = '------------------------------';
      expectObservable(
        e1[switchMap](() => x),
        '^-----------------------------!'
      ).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should switch to an inner that just raises an error', async () => {
    await rxTest(({ hot, observable, expectObservable, expectSubscriptions }) => {
      const x = observable('           #                    ');
      const xsubs = '   ---------(^!)                 ';
      const e1 = hot('  ---------x---------x---------|');
      const e1subs = '  ^--------!                    ';
      const expected = '---------#                    ';
      expectObservable(e1[switchMap](() => x)).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should handle an empty outer', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' |   ');
      const e1subs = '  (^!)';
      const expected = '|   ';
      expectObservable(e1[switchMap](() => Observable.from(['foo']))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should handle a never outer', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' -');
      const e1subs = '^!';
      const expected = '-';
      expectObservable(
        e1[switchMap](() => Observable.from(['foo'])),
        '^!'
      ).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should handle an outer that just raises and error', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' #   ');
      const e1subs = '  (^!)';
      const expected = '#   ';
      expectObservable(e1[switchMap](() => Observable.from(['foo']))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
});
