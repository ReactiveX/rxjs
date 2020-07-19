import { expect } from 'chai';
import { hot, cold, expectObservable, expectSubscriptions, time } from '../helpers/marble-testing';
import { timeout, mergeMap, mergeMapTo } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { TimeoutError, of } from 'rxjs';

declare const rxTestScheduler: TestScheduler;

/** @test {timeout} */
describe('timeout operator', () => {
  const defaultTimeoutError = new TimeoutError();

  it('should timeout after a specified timeout period', () => {
    const e1 =  cold('-------a--b--|');
    const e1subs =   '^    !        ';
    const expected = '-----#        ';

    const result = e1.pipe(timeout(50, rxTestScheduler));

    expectObservable(result).toBe(expected, null, defaultTimeoutError);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should emit and TimeoutError on timeout with appropriate due as number', () => {
    const e1 =  cold('-------a--b--|');
    const result = e1.pipe(timeout(50, rxTestScheduler));
    let error: any;
    result.subscribe(() => {
      throw new Error('this should not next');
    }, err => {
      error = err;
    }, () => {
      throw new Error('this should not complete');
    });
    rxTestScheduler.flush();
    expect(error).to.be.an.instanceof(TimeoutError);
    expect(error).to.have.property('name', 'TimeoutError');
    expect(error!.info).to.deep.equal({
      seen: 0,
      meta: null,
      lastValue: null
    });
  });

  it('should emit and TimeoutError on timeout with appropriate due as Date', () => {
    const e1 =  cold('-------a--b--|');

    // 4ms from "now", considering "now" with the rxTestScheduler is currently frame 0.
    const dueDate = new Date(40);

    const result = e1.pipe(timeout(dueDate, rxTestScheduler));
    let error: any;
    result.subscribe(() => {
      throw new Error('this should not next');
    }, err => {
      error = err;
    }, () => {
      throw new Error('this should not complete');
    });
    rxTestScheduler.flush();
    expect(error).to.be.an.instanceof(TimeoutError);
    expect(error).to.have.property('name', 'TimeoutError');
    expect(error!.info).to.deep.equal({
      seen: 0,
      meta: null,
      lastValue: null
    });
  });

  it('should not timeout if source completes within absolute timeout period', () => {
    const e1 =   hot('--a--b--c--d--e--|');
    const e1subs =   '^                !';
    const expected = '--a--b--c--d--e--|';

    const timeoutValue = new Date(rxTestScheduler.now() + (expected.length + 2) * 10);

    expectObservable(e1.pipe(timeout(timeoutValue, rxTestScheduler))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not timeout if source emits within timeout period', () => {
    const e1 =   hot('--a--b--c--d--e--|');
    const e1subs =   '^                !';
    const expected = '--a--b--c--d--e--|';

    expectObservable(e1.pipe(timeout(50, rxTestScheduler))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should allow unsubscribing explicitly and early', () => {
    const e1 =   hot('--a--b--c---d--e--|');
    const unsub =    '          !        ';
    const e1subs =   '^         !        ';
    const expected = '--a--b--c--        ';

    const result = e1.pipe(timeout(50, rxTestScheduler));

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    const e1 =   hot('--a--b--c---d--e--|');
    const e1subs =   '^         !        ';
    const expected = '--a--b--c--        ';
    const unsub =    '          !        ';

    const result = e1.pipe(
      mergeMap((x: string) => of(x)),
      timeout(50, rxTestScheduler),
      mergeMap((x: string) => of(x))
    );

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should timeout after a specified timeout period between emit with default ' +
  'error while source emits', () => {
    const e1 =   hot('---a---b---c------d---e---|');
    const e1subs =   '^               !          ';
    const expected = '---a---b---c----#          ';
    const values = {a: 'a', b: 'b', c: 'c'};

    const result = e1.pipe(timeout(50, rxTestScheduler));

    expectObservable(result).toBe(expected, values, defaultTimeoutError);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should timeout at a specified Date', () => {
    const e1 =  cold('-');
    const e1subs =   '^         !';
    const expected = '----------#';

    const result = e1.pipe(timeout(new Date(100), rxTestScheduler));

    expectObservable(result).toBe(expected, null, defaultTimeoutError);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should timeout specified Date with default error while source emits', () => {
    const e1 =   hot('--a--b--c--d--e--|');
    const e1subs =   '^         !       ';
    const expected = '--a--b--c-#       ';
    const values = {a: 'a', b: 'b', c: 'c'};

    const result = e1.pipe(timeout(new Date(rxTestScheduler.now() + 100), rxTestScheduler));

    expectObservable(result).toBe(expected, values, defaultTimeoutError);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });
});
