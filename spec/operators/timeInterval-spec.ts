import { hot, cold, expectObservable, expectSubscriptions } from '../helpers/marble-testing';
import { timeInterval, map, mergeMap } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { of } from 'rxjs';
import { TimeInterval } from 'rxjs/internal/operators/timeInterval';

declare function asDiagram(arg: string): Function;

declare const rxTestScheduler: TestScheduler;

/** @test {timeInterval} */
describe('timeInterval operator', () => {
  asDiagram('timeInterval')('should record the time interval between source elements', () => {
    const e1 = hot('--a--^b-c-----d--e--|');
    const e1subs =      '^              !';
    const expected =    '-w-x-----y--z--|';
    const expectedValue = { w: 10, x: 20, y: 60, z: 30 };

    const result = (<any>e1).pipe(
      timeInterval(rxTestScheduler),
      map((x: any) => x.interval)
    );

    expectObservable(result).toBe(expected, expectedValue);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should record interval if source emit elements', () => {
    const e1 = hot('--a--^b--c----d---e--|');
    const e1subs =      '^               !';
    const expected =    '-w--x----y---z--|';

    const expectedValue = {
      w: new TimeInterval('b', 10),
      x: new TimeInterval('c', 30),
      y: new TimeInterval('d', 50),
      z: new TimeInterval('e', 40)
    };

    expectObservable((<any>e1).pipe(timeInterval(rxTestScheduler))).toBe(expected, expectedValue);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should completes without record interval if source does not emits', () => {
    const e1 =   hot('---------|');
    const e1subs =   '^        !';
    const expected = '---------|';

    expectObservable((<any>e1).pipe(timeInterval(rxTestScheduler))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should complete immediately if source is empty', () => {
    const e1 =  cold('|');
    const e1subs =   '(^!)';
    const expected = '|';

    expectObservable((<any>e1).pipe(timeInterval(rxTestScheduler))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should record interval then does not completes if source emits but not completes', () => {
    const e1 =   hot('-a--b--');
    const e1subs =   '^      ';
    const expected = '-y--z--';

    const expectedValue = {
      y: new TimeInterval('a', 10),
      z: new TimeInterval('b', 30)
    };

    expectObservable((<any>e1).pipe(timeInterval(rxTestScheduler))).toBe(expected, expectedValue);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should allow unsubscribing explicitly and early', () => {
    const e1 =   hot('-a--b-----c---d---|');
    const unsub =    '       !           ';
    const e1subs =   '^      !           ';
    const expected = '-y--z---           ';

    const expectedValue = {
      y: new TimeInterval('a', 10),
      z: new TimeInterval('b', 30)
    };

    const result = (<any>e1).pipe(timeInterval(rxTestScheduler));

    expectObservable(result, unsub).toBe(expected, expectedValue);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    const e1 =   hot('-a--b-----c---d---|');
    const e1subs =   '^      !           ';
    const expected = '-y--z---           ';
    const unsub =    '       !           ';

    const expectedValue = {
      y: new TimeInterval('a', 10),
      z: new TimeInterval('b', 30)
    };

    const result = (<any>e1).pipe(
      mergeMap((x: string) => of(x)),
      timeInterval(rxTestScheduler),
      mergeMap((x: string) => of(x))
    );

    expectObservable(result, unsub).toBe(expected, expectedValue);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not completes if source never completes', () => {
    const e1 =  cold('-');
    const e1subs =   '^';
    const expected = '-';

    expectObservable((<any>e1).pipe(timeInterval(rxTestScheduler))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('raise error if source raises error', () => {
    const e1 =   hot('---#');
    const e1subs =   '^  !';
    const expected = '---#';

    expectObservable((<any>e1).pipe(timeInterval(rxTestScheduler))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should record interval then raise error if source raises error after emit', () => {
    const e1 =   hot('-a--b--#');
    const e1subs =   '^      !';
    const expected = '-y--z--#';

    const expectedValue = {
      y: new TimeInterval('a', 10),
      z: new TimeInterval('b', 30)
    };

    expectObservable((<any>e1).pipe(timeInterval(rxTestScheduler))).toBe(expected, expectedValue);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should raise error if source immediately throws', () => {
    const e1 =  cold('#');
    const e1subs =   '(^!)';
    const expected = '#';

    expectObservable((<any>e1).pipe(timeInterval(rxTestScheduler))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });
});
