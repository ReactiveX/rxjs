/* globals describe, it, expect, expectObservable, hot, rxTestScheduler */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.prototype.startWith()', function () {
  var defaultStartValue = 'x';

  it('should start an observable with given value', function () {
    var e1 =   hot('--a--|');
    var expected = 'x-a--|';

    expectObservable(e1.startWith(defaultStartValue)).toBe(expected);
  });

  it('should start with given value and does not completes if source does not completes', function () {
    var e1 =   hot('----a-');
    var expected = 'x---a-';

    expectObservable(e1.startWith(defaultStartValue)).toBe(expected);
  });

  it('should start with given value and does not completes if source never emits', function () {
    var e1 = Observable.never();
    var expected = 'x-';

    expectObservable(e1.startWith(defaultStartValue)).toBe(expected);
  });

  it('should start with given value and completes if source does not emits', function () {
    var e1 =   hot('---|');
    var expected = 'x--|';

    expectObservable(e1.startWith(defaultStartValue)).toBe(expected);
  });

  it('should start with given value and complete immediately if source is empty', function () {
    var e1 = Observable.empty();
    var expected = '(x|)';

    expectObservable(e1.startWith(defaultStartValue)).toBe(expected);
  });

  it('should start with given value and source both if source emits single value', function () {
    var e1 = Observable.of('a');
    var expected = '(xa|)';

    expectObservable(e1.startWith(defaultStartValue)).toBe(expected);
  });

  it('should start with given values when given value is more than one', function () {
    var e1 =   hot('-----a--|');
    var expected = '(yz)-a--|';

    expectObservable(e1.startWith('y','z')).toBe(expected);
  });

  it('should start with given value and raises error if source raises error', function () {
    var e1 =   hot('--#');
    var expected = 'x-#';

    expectObservable(e1.startWith(defaultStartValue)).toBe(expected, defaultStartValue);
  });

  it('should start with given value and raises error immediately if source throws error', function () {
    var error = 'error';
    var e1 = Observable.throw(error);
    var expected = '(x#)';

    expectObservable(e1.startWith(defaultStartValue)).toBe(expected, defaultStartValue, error);
  });

  it('should start with empty if given value is not specified', function () {
    var e1 =   hot('-a-|');
    var expected = '-a-|';

    expectObservable(e1.startWith(rxTestScheduler)).toBe(expected);
  });

  it('should accept scheduler as last argument with single value', function () {
    var e1 =   hot('--a--|');
    var expected = 'x-a--|';

    expectObservable(e1.startWith(defaultStartValue, rxTestScheduler)).toBe(expected);
  });

  it('should accept scheduler as last argument with multiple value', function () {
    var e1 =   hot('-----a--|');
    var expected = '(yz)-a--|';

    expectObservable(e1.startWith('y','z', rxTestScheduler)).toBe(expected);
  });
});
