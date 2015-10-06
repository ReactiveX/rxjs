/* globals describe, it, expect, expectObservable, hot, cold, rxTestScheduler */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.prototype.timeoutWith()', function () {
  it('should timeout after a specified period then subscribe to the passed observable', function () {
    var e1 = Observable.never();
    var e2 =  cold('--x--y--z--|');
    var expected = '-------x--y--z--|';

    expectObservable(e1.timeoutWith(50, e2, rxTestScheduler)).toBe(expected);
  });

  it('should timeout at a specified date then subscribe to the passed observable', function () {
    var e1 = Observable.never();
    var e2 = cold('--x--y--z--|');
    var expected = '------------x--y--z--|';

    expectObservable(e1.timeoutWith(new Date(rxTestScheduler.now() + 100), e2, rxTestScheduler)).toBe(expected);
  });

  it('should timeout after a specified period between emit then subscribe to the passed observable when source emits', function () {
    var e1 =     hot('---a---b------c---|');
    var e2 =    cold('-x-y-|');
    var expected =   '---a---b----x-y-|';

    expectObservable(e1.timeoutWith(40, e2, rxTestScheduler)).toBe(expected);
  });

  it('should timeout after a specified period then subscribe to the passed observable when source is empty', function () {
    var e1 =   hot('-------------|');
    var e2 =  cold('----x----|');
    var expected = '--------------x----|';

    expectObservable(e1.timeoutWith(100, e2, rxTestScheduler)).toBe(expected);
  });

  it('should timeout after a specified period between emit then never completes if other source does not complete', function () {
    var e1 =   hot('--a--b--------c--d--|');
    var e2 =  cold('-');
    var expected = '--a--b----';

    expectObservable(e1.timeoutWith(40, e2, rxTestScheduler)).toBe(expected);
  });

  it('should timeout after a specified period then subscribe to the passed observable when source raises error after timeout', function () {
    var e1 =   hot('-------------#');
    var e2 =  cold('----x----|');
    var expected = '--------------x----|';

    expectObservable(e1.timeoutWith(100, e2, rxTestScheduler)).toBe(expected);
  });

  it('should timeout after a specified period between emit then never completes if other source emits but not complete', function () {
    var e1 =   hot('-------------|');
    var e2 =  cold('----x----');
    var expected = '--------------x----';

    expectObservable(e1.timeoutWith(100, e2, rxTestScheduler)).toBe(expected);
  });

  it('should not timeout if source completes within timeout period', function () {
    var e1 =   hot('-----|');
    var e2 =  cold('----x----');
    var expected = '-----|';

    expectObservable(e1.timeoutWith(100, e2, rxTestScheduler)).toBe(expected);
  });

  it('should not timeout if source raises error within timeout period', function () {
    var e1 =   hot('-----#');
    var e2 =  cold('----x----|');
    var expected = '-----#';

    expectObservable(e1.timeoutWith(100, e2, rxTestScheduler)).toBe(expected);
  });

  it('should not timeout if source emits within timeout period', function () {
    var e1 =   hot('--a--b--c--d--e--|');
    var e2 =  cold('----x----|');
    var expected = '--a--b--c--d--e--|';

    expectObservable(e1.timeoutWith(50, e2, rxTestScheduler)).toBe(expected);
  });

  it('should timeout after specified Date then subscribe to the passed observable', function () {
    var e1 =   hot('--a--b--c--d--e--|');
    var e2 =  cold('--z--|');
    var expected = '--a--b---z--|';

    expectObservable(e1.timeoutWith(new Date(rxTestScheduler.now() + 70), e2, rxTestScheduler)).toBe(expected);
  });

  it('should not timeout if source completes within specified Date', function () {
    var e1 =   hot('--a--b--c--d--e--|');
    var e2 =  cold('--x--|');
    var expected = '--a--b--c--d--e--|';

    var timeoutValue = new Date(Date.now() + (expected.length + 2) * 10);

    expectObservable(e1.timeoutWith(timeoutValue, e2, rxTestScheduler)).toBe(expected);
  });

  it('should not timeout if source raises error within specified Date', function () {
    var e1 =   hot('---a---#');
    var e2 =  cold('--x--|');
    var expected = '---a---#';

    expectObservable(e1.timeoutWith(new Date(Date.now() + 100), e2, rxTestScheduler)).toBe(expected);
  });

  it('should timeout specified Date after specified Date then never completes if other source does not complete', function () {
    var e1 =   hot('---a---b---c---d---e---|');
    var e2 =  cold('-');
    var expected = '---a---b--';

    expectObservable(e1.timeoutWith(new Date(rxTestScheduler.now() + 100), e2, rxTestScheduler)).toBe(expected);
  });
});
