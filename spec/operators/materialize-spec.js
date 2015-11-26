/* globals describe, it, expect, expectObservable, expectSubscriptions, hot, cold */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;
var Notification = Rx.Notification;

describe('Observable.prototype.materialize()', function () {
  it('should materialize a happy stream', function () {
    var e1 =   hot('--a--b--c--|');
    var e1subs =   '^          !';
    var expected = '--w--x--y--(z|)';

    var expectedValue = {
      w: Notification.createNext('a'),
      x: Notification.createNext('b'),
      y: Notification.createNext('c'),
      z: Notification.createComplete()
    };

    expectObservable(e1.materialize()).toBe(expected, expectedValue);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should materialize a sad stream', function () {
    var e1 =   hot('--a--b--c--#');
    var e1subs =   '^          !';
    var expected = '--w--x--y--(z|)';

    var expectedValue = {
      w: Notification.createNext('a'),
      x: Notification.createNext('b'),
      y: Notification.createNext('c'),
      z: Notification.createError('error')
    };

    expectObservable(e1.materialize()).toBe(expected, expectedValue);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should allow unsubscribing explicitly and early', function () {
    var e1 =   hot('--a--b--c--|');
    var unsub =    '      !     ';
    var e1subs =   '^     !     ';
    var expected = '--w--x-     ';

    var expectedValue = {
      w: Notification.createNext('a'),
      x: Notification.createNext('b')
    };

    expectObservable(e1.materialize(), unsub).toBe(expected, expectedValue);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should materialize stream does not completes', function () {
    var e1 =   hot('-');
    var e1subs =   '^';
    var expected = '-';

    expectObservable(e1.materialize()).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should materialize stream never completes', function () {
    var e1 =  cold('-');
    var e1subs =   '^';
    var expected = '-';

    expectObservable(e1.materialize()).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should materialize stream does not emit', function () {
    var e1 =   hot('----|');
    var e1subs =   '^   !';
    var expected = '----(x|)';

    expectObservable(e1.materialize()).toBe(expected, { x: Notification.createComplete() });
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should materialize empty stream', function () {
    var e1 =  cold('|');
    var e1subs =   '(^!)';
    var expected = '(x|)';

    expectObservable(e1.materialize()).toBe(expected, { x: Notification.createComplete() });
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should materialize stream throws', function () {
    var e1 =  cold('#');
    var e1subs =   '(^!)';
    var expected = '(x|)';

    expectObservable(e1.materialize()).toBe(expected, { x: Notification.createError('error') });
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });
});