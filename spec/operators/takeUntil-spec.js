/* globals describe, it, expect, hot, cold, expectObservable */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.prototype.takeUntil()', function () {
  it('should take values until another observable emits', function () {
    var e1 =     hot('--a--b--c--d--e--f--g--|');
    var e2 =     hot('-------------z--|');
    var expected =   '--a--b--c--d-|';

    expectObservable(e1.takeUntil(e2)).toBe(expected);
  });

  it('should take values and raises error until another observable raises error', function () {
    var e1 =     hot('--a--b--c--d--e--f--g--|');
    var e2 =     hot('-------------#--|');
    var expected =   '--a--b--c--d-#';

    expectObservable(e1.takeUntil(e2)).toBe(expected);
  });

  it('should take all values when another observable is empty', function () {
    var e1 =     hot('--a--b--c--d--e--f--g--|');
    var e2 =     hot('-------------|');
    var expected =   '--a--b--c--d--e--f--g--|';

    expectObservable(e1.takeUntil(e2)).toBe(expected);
  });

  it('should take all values when another observable does not completes', function () {
    var e1 =     hot('--a--b--c--d--e--f--g--|');
    var e2 =     hot('-');
    var expected =   '--a--b--c--d--e--f--g--|';

    expectObservable(e1.takeUntil(e2)).toBe(expected);
  });

  it('should completes when another observable emits if source observable does not completes', function () {
    var e1 =     hot('-');
    var e2 =     hot('--a--b--|');
    var expected =   '--|';

    expectObservable(e1.takeUntil(e2)).toBe(expected);
  });

  it('should raises error when another observable raises error if source observable does not completes', function () {
    var e1 =     hot('-');
    var e2 =     hot('--#');
    var expected =   '--#';

    expectObservable(e1.takeUntil(e2)).toBe(expected);
  });

  it('should not completes when another observable is empty if source observable does not completes', function () {
    var e1 =     hot('-');
    var e2 =     hot('--|');
    var expected =   '-';

    expectObservable(e1.takeUntil(e2)).toBe(expected);
  });

  it('should not completes when source and another observable does not complete', function () {
    var e1 =     hot('-');
    var e2 =     hot('-');
    var expected =   '-';

    expectObservable(e1.takeUntil(e2)).toBe(expected);
  });

  it('should completes when another observable emits before source observable emits', function () {
    var e1 =     hot('----a--|');
    var e2 =     hot('--x');
    var expected =   '--|';

    expectObservable(e1.takeUntil(e2)).toBe(expected);
  });

  it('should raises error if source raises error before another observable emits', function () {
    var e1 =     hot('--a--b--c--d--#');
    var e2 =     hot('----------------a--|');
    var expected =   '--a--b--c--d--#';

    expectObservable(e1.takeUntil(e2)).toBe(expected);
  });

  it('should raise error immediately if source throws', function () {
    var value = 'error';
    var e1 = Observable.throw(value);
    var e2 =   hot('--x');
    var expected = '#';

    expectObservable(e1.takeUntil(e2)).toBe(expected, null, value);
  });

  it('should dispose source observable if another source observable emits before source emits', function () {
    var signaled = false;
    var e1 =   hot('---a---|').do(function () { signaled = true; });
    var e2 =   hot('-x--|');
    var expected = '-|';

    expectObservable(e1.takeUntil(e2)).toBe(expected);
    expect(signaled).toBe(false);
  });

  it('should dispose another observable if source observable completes', function () {
    var signaled = false;
    var e1 =   hot('--a--|');
    var e2 =   hot('-------x--|').do(function (x) { signaled = true; });
    var expected = '--a--|';

    expectObservable(e1.takeUntil(e2)).toBe(expected);
    expect(signaled).toBe(false);
  });
});
