import * as Rx from '../../dist/package/Rx';
import marbleTestingSignature = require('../helpers/marble-testing'); // tslint:disable-line:no-require-imports

declare const { asDiagram };
declare const hot: typeof marbleTestingSignature.hot;
declare const expectObservable: typeof marbleTestingSignature.expectObservable;
declare const expectSubscriptions: typeof marbleTestingSignature.expectSubscriptions;

declare const rxTestScheduler: Rx.TestScheduler;
const Observable = Rx.Observable;

/** @test {subscribeOn} */
describe('Observable.prototype.subscribeOn', () => {
  asDiagram('subscribeOn(scheduler)')('should subscribe on specified scheduler', () => {
    const e1 =   hot('--a--b--|');
    const expected = '--a--b--|';
    const sub =      '^       !';

    expectObservable(e1.subscribeOn(rxTestScheduler)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(sub);
  });

  it('should start subscribe after specified delay', () => {
    const e1 =   hot('--a--b--|');
    const expected = '-----b--|';
    const sub =      '   ^    !';

    expectObservable(e1.subscribeOn(rxTestScheduler, 30)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(sub);
  });

  it('should subscribe when source raises error', () => {
    const e1 =   hot('--a--#');
    const expected = '--a--#';
    const sub =      '^    !';

    expectObservable(e1.subscribeOn(rxTestScheduler)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(sub);
  });

  it('should subscribe when source is empty', () => {
    const e1 =   hot('----|');
    const expected = '----|';
    const sub =      '^   !';

    expectObservable(e1.subscribeOn(rxTestScheduler)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(sub);
  });

  it('should subscribe when source does not complete', () => {
    const e1 =   hot('----');
    const expected = '----';
    const sub =      '^   ';

    expectObservable(e1.subscribeOn(rxTestScheduler)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(sub);
  });

  it('should allow unsubscribing early and explicitly', () => {
    const e1 =    hot('--a--b--|');
    const sub =       '^   !    ';
    const expected =  '--a--    ';
    const unsub =     '    !    ';

    const result = e1.subscribeOn(rxTestScheduler);

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(sub);
  });

  it('should not break unsubscription chains when the result is unsubscribed explicitly', () => {
    const e1 =    hot('--a--b--|');
    const sub =       '^   !    ';
    const expected =  '--a--    ';
    const unsub =     '    !    ';

    const result = e1
      .mergeMap((x: string) => Observable.of(x))
      .subscribeOn(rxTestScheduler)
      .mergeMap((x: string) => Observable.of(x));

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(sub);
  });
});
