import { expect } from 'chai';
import { hot, cold, expectObservable, expectSubscriptions } from '../helpers/marble-testing';
import { timeout, mergeMap } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { TimeoutError, of } from 'rxjs';

declare function asDiagram(arg: string): Function;
declare const rxTestScheduler: TestScheduler;

/** @test {timeout} */
describe('timeout operator', () => {
  const defaultTimeoutError = new TimeoutError();

  asDiagram('timeout(50)')('should timeout after a specified timeout period', () => {
    const e1 =  cold('-------a--b--|');
    const e1subs =   '^    !        ';
    const expected = '-----#        ';

    const result = e1.pipe(timeout(50, rxTestScheduler));

    expectObservable(result).toBe(expected, null, defaultTimeoutError);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should emit and error of an instanceof TimeoutError on timeout', () => {
    const e1 =  cold('-------a--b--|');
    const result = e1.pipe(timeout(50, rxTestScheduler));
    let error;
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

    const result = e1.pipe(timeout(new Date(rxTestScheduler.now() + 100), rxTestScheduler));

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

  it('should unsubscribe from the scheduled timeout action when timeout is unsubscribed early', () => {
    const e1 =   hot('--a--b--c---d--e--|');
    const e1subs =   '^         !        ';
    const expected = '--a--b--c--        ';
    const unsub =    '          !        ';

    const result = e1
      .lift({
        call: (timeoutSubscriber, source) => {
          const { action } = <any> timeoutSubscriber; // get a ref to the action here
          timeoutSubscriber.add(() => {               // because it'll be null by the
            if (!action.closed) {                     // time we get into this function.
              throw new Error('TimeoutSubscriber scheduled action wasn\'t canceled');
            }
          });
          return source.subscribe(timeoutSubscriber);
        }
      })
      .pipe(timeout(50, rxTestScheduler));

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });
});
