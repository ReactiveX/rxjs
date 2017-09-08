import * as Rx from '../../dist/package/Rx';
import marbleTestingSignature = require('../helpers/marble-testing'); // tslint:disable-line:no-require-imports

declare const { asDiagram };
declare const hot: typeof marbleTestingSignature.hot;
declare const cold: typeof marbleTestingSignature.cold;
declare const expectObservable: typeof marbleTestingSignature.expectObservable;
declare const expectSubscriptions: typeof marbleTestingSignature.expectSubscriptions;

const Observable = Rx.Observable;

/** @test {takeUntil} */
describe('Observable.prototype.takeUntil', () => {
  asDiagram('takeUntil')('should take values until notifier emits', () => {
    const e1 =     hot('--a--b--c--d--e--f--g--|');
    const e1subs =     '^            !          ';
    const e2 =     hot('-------------z--|       ');
    const e2subs =     '^            !          ';
    const expected =   '--a--b--c--d-|          ';

    expectObservable(e1.takeUntil(e2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should take values and raises error when notifier raises error', () => {
    const e1 =     hot('--a--b--c--d--e--f--g--|');
    const e1subs =     '^            !          ';
    const e2 =     hot('-------------#          ');
    const e2subs =     '^            !          ';
    const expected =   '--a--b--c--d-#          ';

    expectObservable(e1.takeUntil(e2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should take all values when notifier is empty', () => {
    const e1 =     hot('--a--b--c--d--e--f--g--|');
    const e1subs =     '^                      !';
    const e2 =     hot('-------------|          ');
    const e2subs =     '^            !          ';
    const expected =   '--a--b--c--d--e--f--g--|';

    expectObservable(e1.takeUntil(e2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should take all values when notifier does not complete', () => {
    const e1 =     hot('--a--b--c--d--e--f--g--|');
    const e1subs =     '^                      !';
    const e2 =     hot('-');
    const e2subs =     '^                      !';
    const expected =   '--a--b--c--d--e--f--g--|';

    expectObservable(e1.takeUntil(e2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should allow unsubscribing explicitly and early', () => {
    const e1 =     hot('--a--b--c--d--e--f--g--|');
    const e1subs =     '^      !                ';
    const e2 =     hot('-------------z--|       ');
    const e2subs =     '^      !                ';
    const unsub =      '       !                ';
    const expected =   '--a--b--                ';

    expectObservable(e1.takeUntil(e2), unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should complete when notifier emits if source observable does not complete', () => {
    const e1 =     hot('-');
    const e1subs =     '^ !';
    const e2 =     hot('--a--b--|');
    const e2subs =     '^ !';
    const expected =   '--|';

    expectObservable(e1.takeUntil(e2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should raise error when notifier raises error if source observable does not complete', () => {
    const e1 =     hot('-');
    const e1subs =     '^ !';
    const e2 =     hot('--#');
    const e2subs =     '^ !';
    const expected =   '--#';

    expectObservable(e1.takeUntil(e2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should not complete when notifier is empty if source observable does not complete', () => {
    const e1 =     hot('-');
    const e1subs =     '^';
    const e2 =     hot('--|');
    const e2subs =     '^ !';
    const expected =   '---';

    expectObservable(e1.takeUntil(e2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should not complete when source and notifier do not complete', () => {
    const e1 =     hot('-');
    const e1subs =     '^';
    const e2 =     hot('-');
    const e2subs =     '^';
    const expected =   '-';

    expectObservable(e1.takeUntil(e2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should complete when notifier emits before source observable emits', () => {
    const e1 =     hot('----a--|');
    const e1subs =     '^ !     ';
    const e2 =     hot('--x     ');
    const e2subs =     '^ !     ';
    const expected =   '--|     ';

    expectObservable(e1.takeUntil(e2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should raise error if source raises error before notifier emits', () => {
    const e1 =     hot('--a--b--c--d--#     ');
    const e1subs =     '^             !     ';
    const e2 =     hot('----------------a--|');
    const e2subs =     '^             !     ';
    const expected =   '--a--b--c--d--#     ';

    expectObservable(e1.takeUntil(e2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should raise error immediately if source throws', () => {
    const e1 = cold( '#');
    const e1subs =   '(^!)';
    const e2 =   hot('--x');
    const e2subs =   '(^!)';
    const expected = '#';

    expectObservable(e1.takeUntil(e2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should dispose source observable if notifier emits before source emits', () => {
    const e1 =   hot('---a---|');
    const e1subs =   '^ !     ';
    const e2 =   hot('--x-|   ');
    const e2subs =   '^ !     ';
    const expected = '--|     ';

    expectObservable(e1.takeUntil(e2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should dispose notifier if source observable completes', () => {
    const e1 =   hot('--a--|     ');
    const e1subs =   '^    !     ';
    const e2 =   hot('-------x--|');
    const e2subs =   '^    !     ';
    const expected = '--a--|     ';

    expectObservable(e1.takeUntil(e2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should not break unsubscription chain when unsubscribed explicitly', () => {
    const e1 =     hot('--a--b--c--d--e--f--g--|');
    const e1subs =     '^      !                ';
    const e2 =     hot('-------------z--|       ');
    const e2subs =     '^      !                ';
    const unsub =      '       !                ';
    const expected =   '--a--b--                ';

    const result = e1
      .mergeMap((x: string) => Observable.of(x))
      .takeUntil(e2)
      .mergeMap((x: string) => Observable.of(x));

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });
});
