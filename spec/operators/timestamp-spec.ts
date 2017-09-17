import * as Rx from '../../dist/package/Rx';
import marbleTestingSignature = require('../helpers/marble-testing'); // tslint:disable-line:no-require-imports

declare const { asDiagram };
declare const hot: typeof marbleTestingSignature.hot;
declare const cold: typeof marbleTestingSignature.cold;
declare const expectObservable: typeof marbleTestingSignature.expectObservable;
declare const expectSubscriptions: typeof marbleTestingSignature.expectSubscriptions;

declare const rxTestScheduler: Rx.TestScheduler;
const Observable = Rx.Observable;

/** @test {timestamp} */
describe('Observable.prototype.timestamp', () => {
  asDiagram('timestamp')('should record the time stamp per each source elements', () => {
    const e1 =   hot('-b-c-----d--e--|');
    const e1subs =   '^              !';
    const expected = '-w-x-----y--z--|';
    const expectedValue = { w: 10, x: 30, y: 90, z: 120 };

    const result = e1.timestamp(rxTestScheduler)
      .map(x => x.timestamp);

    expectObservable(result).toBe(expected, expectedValue);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should record stamp if source emit elements', () => {
    const e1 = hot('--a--^b--c----d---e--|');
    const e1subs =      '^               !';
    const expected =    '-w--x----y---z--|';

    const expectedValue = {
      w: new Rx.Timestamp('b', 10),
      x: new Rx.Timestamp('c', 40),
      y: new Rx.Timestamp('d', 90),
      z: new Rx.Timestamp('e', 130)
    };

    expectObservable(e1.timestamp(rxTestScheduler)).toBe(expected, expectedValue);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should completes without record stamp if source does not emits', () => {
    const e1 =   hot('---------|');
    const e1subs =   '^        !';
    const expected = '---------|';

    expectObservable(e1.timestamp(rxTestScheduler)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should complete immediately if source is empty', () => {
    const e1 =  cold('|');
    const e1subs =   '(^!)';
    const expected = '|';

    expectObservable(e1.timestamp(rxTestScheduler)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should record stamp then does not completes if source emits but not completes', () => {
    const e1 =   hot('-a--b--');
    const e1subs =   '^      ';
    const expected = '-y--z--';

    const expectedValue = {
      y: new Rx.Timestamp('a', 10),
      z: new Rx.Timestamp('b', 40)
    };

    expectObservable(e1.timestamp(rxTestScheduler)).toBe(expected, expectedValue);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should allow unsubscribing explicitly and early', () => {
    const e1 =   hot('-a--b-----c---d---|');
    const unsub =    '       !           ';
    const e1subs =   '^      !           ';
    const expected = '-y--z---           ';

    const expectedValue = {
      y: new Rx.Timestamp('a', 10),
      z: new Rx.Timestamp('b', 40)
    };

    const result = e1.timestamp(rxTestScheduler);

    expectObservable(result, unsub).toBe(expected, expectedValue);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    const e1 =   hot('-a--b-----c---d---|');
    const e1subs =   '^      !           ';
    const expected = '-y--z---           ';
    const unsub =    '       !           ';

    const expectedValue = {
      y: new Rx.Timestamp('a', 10),
      z: new Rx.Timestamp('b', 40)
    };

    const result = e1
      .mergeMap(x => Observable.of(x))
      .timestamp(rxTestScheduler)
      .mergeMap(x => Observable.of(x));

    expectObservable(result, unsub).toBe(expected, expectedValue);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not completes if source never completes', () => {
    const e1 =  cold('-');
    const e1subs =   '^';
    const expected = '-';

    expectObservable(e1.timestamp(rxTestScheduler)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('raise error if source raises error', () => {
    const e1 =   hot('---#');
    const e1subs =   '^  !';
    const expected = '---#';

    expectObservable(e1.timestamp(rxTestScheduler)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should record stamp then raise error if source raises error after emit', () => {
    const e1 =   hot('-a--b--#');
    const e1subs =   '^      !';
    const expected = '-y--z--#';

    const expectedValue = {
      y: new Rx.Timestamp('a', 10),
      z: new Rx.Timestamp('b', 40)
    };

    expectObservable(e1.timestamp(rxTestScheduler)).toBe(expected, expectedValue);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should raise error if source immediately throws', () => {
    const e1 =  cold('#');
    const e1subs =   '(^!)';
    const expected = '#';

    expectObservable(e1.timestamp(rxTestScheduler)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });
});