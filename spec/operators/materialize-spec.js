/* globals describe, it, expect, expectObservable, hot */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;
var Notification = Rx.Notification;

describe('Observable.prototype.materialize()', function () {
  it('should materialize a happy stream', function () {
    var e1 =   hot('--a--b--c--|');
    var expected = '--w--x--y--(z|)';

    var expectedValue = {
      w: Notification.createNext('a'),
      x: Notification.createNext('b'),
      y: Notification.createNext('c'),
      z: Notification.createComplete()
    };

    expectObservable(e1.materialize()).toBe(expected, expectedValue);
  });

  it('should materialize a sad stream', function () {
    var e1 =   hot('--a--b--c--#');
    var expected = '--w--x--y--(z|)';

    var expectedValue = {
      w: Notification.createNext('a'),
      x: Notification.createNext('b'),
      y: Notification.createNext('c'),
      z: Notification.createError('error')
    };

    expectObservable(e1.materialize()).toBe(expected, expectedValue);
  });

  it('should materialize stream does not completes', function () {
    var e1 =   hot('------');
    var expected = '-';

    expectObservable(e1.materialize()).toBe(expected);
  });

  it('should materialize stream never completes', function () {
    var e1 = Observable.never();
    var expected = '-';

    expectObservable(e1.materialize()).toBe(expected);
  });

  it('should materialize stream does not emit', function () {
    var e1 =   hot('----|');
    var expected = '----(x|)';

    expectObservable(e1.materialize()).toBe(expected, { x: Notification.createComplete() });
  });

  it('should materialize empty stream', function () {
    var e1 = Observable.empty();
    var expected = '(x|)';

    expectObservable(e1.materialize()).toBe(expected, { x: Notification.createComplete() });
  });

  it('should materialize stream throws', function () {
    var error = 'error';
    var e1 = Observable.throw(error);
    var expected = '(x|)';

    expectObservable(e1.materialize()).toBe(expected, { x: Notification.createError(error) });
  });
});