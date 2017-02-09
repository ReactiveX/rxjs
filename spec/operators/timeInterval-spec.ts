import * as Rx from '../../dist/cjs/Rx';
import marbleTestingSignature = require('../helpers/marble-testing'); // tslint:disable-line:no-require-imports

declare const { asDiagram };
declare const hot: typeof marbleTestingSignature.hot;
declare const cold: typeof marbleTestingSignature.cold;
declare const expectObservable: typeof marbleTestingSignature.expectObservable;
declare const expectSubscriptions: typeof marbleTestingSignature.expectSubscriptions;

declare const rxTestScheduler: Rx.TestScheduler;
const Observable = Rx.Observable;

/** @test {timeInterval} */
describe('Observable.prototype.timeInterval', () => {
  asDiagram('timeInterval')('should record the time interval between source elements', () => {
    const e1 = hot('--a--^b-c-----d--e--|');
    const e1subs =      '^              !';
    const expected =    '-w-x-----y--z--|';
    const expectedValue = { w: 10, x: 20, y: 60, z: 30 };

    const result = (<any>e1).timeInterval(rxTestScheduler)
      .map((x: any) => x.interval);

    expectObservable(result).toBe(expected, expectedValue);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should record interval if source emit elements', () => {
    const e1 = hot('--a--^b--c----d---e--|');
    const e1subs =      '^               !';
    const expected =    '-w--x----y---z--|';

    const expectedValue = {
      w: new Rx.TimeInterval('b', 10),
      x: new Rx.TimeInterval('c', 30),
      y: new Rx.TimeInterval('d', 50),
      z: new Rx.TimeInterval('e', 40)
    };

    expectObservable((<any>e1).timeInterval(rxTestScheduler)).toBe(expected, expectedValue);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should completes without record interval if source does not emits', () => {
    const e1 =   hot('---------|');
    const e1subs =   '^        !';
    const expected = '---------|';

    expectObservable((<any>e1).timeInterval(rxTestScheduler)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should complete immediately if source is empty', () => {
    const e1 =  cold('|');
    const e1subs =   '(^!)';
    const expected = '|';

    expectObservable((<any>e1).timeInterval(rxTestScheduler)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should record interval then does not completes if source emits but not completes', () => {
    const e1 =   hot('-a--b--');
    const e1subs =   '^      ';
    const expected = '-y--z--';

    const expectedValue = {
      y: new Rx.TimeInterval('a', 10),
      z: new Rx.TimeInterval('b', 30)
    };

    expectObservable((<any>e1).timeInterval(rxTestScheduler)).toBe(expected, expectedValue);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should allow unsubscribing explicitly and early', () => {
    const e1 =   hot('-a--b-----c---d---|');
    const unsub =    '       !           ';
    const e1subs =   '^      !           ';
    const expected = '-y--z---           ';

    const expectedValue = {
      y: new Rx.TimeInterval('a', 10),
      z: new Rx.TimeInterval('b', 30)
    };

    const result = (<any>e1).timeInterval(rxTestScheduler);

    expectObservable(result, unsub).toBe(expected, expectedValue);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    const e1 =   hot('-a--b-----c---d---|');
    const e1subs =   '^      !           ';
    const expected = '-y--z---           ';
    const unsub =    '       !           ';

    const expectedValue = {
      y: new Rx.TimeInterval('a', 10),
      z: new Rx.TimeInterval('b', 30)
    };

    const result = (<any>e1)
      .mergeMap((x: string) => Observable.of(x))
      .timeInterval(rxTestScheduler)
      .mergeMap((x: string) => Observable.of(x));

    expectObservable(result, unsub).toBe(expected, expectedValue);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not completes if source never completes', () => {
    const e1 =  cold('-');
    const e1subs =   '^';
    const expected = '-';

    expectObservable((<any>e1).timeInterval(rxTestScheduler)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('raise error if source raises error', () => {
    const e1 =   hot('---#');
    const e1subs =   '^  !';
    const expected = '---#';

    expectObservable((<any>e1).timeInterval(rxTestScheduler)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should record interval then raise error if source raises error after emit', () => {
    const e1 =   hot('-a--b--#');
    const e1subs =   '^      !';
    const expected = '-y--z--#';

    const expectedValue = {
      y: new Rx.TimeInterval('a', 10),
      z: new Rx.TimeInterval('b', 30)
    };

    expectObservable((<any>e1).timeInterval(rxTestScheduler)).toBe(expected, expectedValue);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should raise error if source immediately throws', () => {
    const e1 =  cold('#');
    const e1subs =   '(^!)';
    const expected = '#';

    expectObservable((<any>e1).timeInterval(rxTestScheduler)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });
});