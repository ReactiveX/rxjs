import * as Rx from '../../dist/cjs/Rx';
declare const {hot, cold, asDiagram, expectObservable, expectSubscriptions};

declare const rxTestScheduler: Rx.TestScheduler;
const Observable = Rx.Observable;

/** @test {timeout} */
describe('Observable.prototype.timeout', () => {
  const defaultTimeoutError = new Error('timeout');

  asDiagram('timeout(50)')('should timeout after a specified timeout period', () => {
    const e1 =  cold('-------a--b--|');
    const e1subs =   '^    !        ';
    const expected = '-----#        ';

    const result = e1.timeout(50, null, rxTestScheduler);

    expectObservable(result).toBe(expected, null, defaultTimeoutError);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should timeout after specified timeout period and send the passed error', () => {
    const e1 =  cold('-');
    const e1subs =   '^    !';
    const expected = '-----#';
    const value = 'hello';

    const result = e1.timeout(50, value, rxTestScheduler);

    expectObservable(result).toBe(expected, null, value);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not timeout if source completes within absolute timeout period', () => {
    const e1 =   hot('--a--b--c--d--e--|');
    const e1subs =   '^                !';
    const expected = '--a--b--c--d--e--|';

    const timeoutValue = new Date(rxTestScheduler.now() + (expected.length + 2) * 10);

    expectObservable(e1.timeout(timeoutValue, null, rxTestScheduler)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not timeout if source emits within timeout period', () => {
    const e1 =   hot('--a--b--c--d--e--|');
    const e1subs =   '^                !';
    const expected = '--a--b--c--d--e--|';

    expectObservable(e1.timeout(50, null, rxTestScheduler)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should allow unsubscribing explicitly and early', () => {
    const e1 =   hot('--a--b--c---d--e--|');
    const unsub =    '          !        ';
    const e1subs =   '^         !        ';
    const expected = '--a--b--c--        ';

    const result = e1.timeout(50, null, rxTestScheduler);

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    const e1 =   hot('--a--b--c---d--e--|');
    const e1subs =   '^         !        ';
    const expected = '--a--b--c--        ';
    const unsub =    '          !        ';

    const result = e1
      .mergeMap((x: string) => Observable.of(x))
      .timeout(50, null, rxTestScheduler)
      .mergeMap((x: string) => Observable.of(x));

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should timeout after a specified timeout period between emit with default ' +
  'error while source emits', () => {
    const e1 =   hot('---a---b---c------d---e---|');
    const e1subs =   '^               !          ';
    const expected = '---a---b---c----#          ';
    const values = {a: 'a', b: 'b', c: 'c'};

    const result = e1.timeout(50, null, rxTestScheduler);

    expectObservable(result).toBe(expected, values, defaultTimeoutError);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should timeout after a specified delay with passed error while source emits', () => {
    const value = 'hello';
    const e1 =   hot('---a---b---c------d---e---|');
    const e1subs =   '^               !          ';
    const expected = '---a---b---c----#          ';
    const values = {a: 'a', b: 'b', c: 'c'};

    const result = e1.timeout(50, value, rxTestScheduler);

    expectObservable(result).toBe(expected, values, value);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should timeout at a specified Date', () => {
    const e1 =  cold('-');
    const e1subs =   '^         !';
    const expected = '----------#';

    const result = e1.timeout(new Date(rxTestScheduler.now() + 100), null, rxTestScheduler);

    expectObservable(result).toBe(expected, null, defaultTimeoutError);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should timeout specified Date with default error while source emits', () => {
    const e1 =   hot('--a--b--c--d--e--|');
    const e1subs =   '^         !       ';
    const expected = '--a--b--c-#       ';
    const values = {a: 'a', b: 'b', c: 'c'};

    const result = e1.timeout(new Date(rxTestScheduler.now() + 100), null, rxTestScheduler);

    expectObservable(result).toBe(expected, values, defaultTimeoutError);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should timeout specified Date with passed error while source emits', () => {
    const value = 'hello';
    const e1 =   hot('--a--b--c--d--e--|');
    const e1subs =   '^         !       ';
    const expected = '--a--b--c-#       ';
    const values = {a: 'a', b: 'b', c: 'c'};

    const result = e1.timeout(new Date(rxTestScheduler.now() + 100), value, rxTestScheduler);

    expectObservable(result).toBe(expected, values, value);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });
});
