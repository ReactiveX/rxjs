/* globals describe, it, expect, expectObservable, expectSubscriptions, hot, cold */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;
var Notification = Rx.Notification;

describe('Observable.prototype.dematerialize()', function () {
  it('should dematerialize a happy stream', function () {
    var values = {
      a: Notification.createNext('w'),
      b: Notification.createNext('x'),
      c: Notification.createNext('y'),
      d: Notification.createComplete()
    };

    var e1 =   hot('--a--b--c--d--|', values);
    var e1subs =   '^          !';
    var expected = '--w--x--y--|';

    expectObservable(e1.dematerialize()).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should dematerialize a sad stream', function () {
    var values = {
      a: Notification.createNext('w'),
      b: Notification.createNext('x'),
      c: Notification.createNext('y'),
      d: Notification.createError('error')
    };

    var e1 =   hot('--a--b--c--d--|', values);
    var e1subs =   '^          !';
    var expected = '--w--x--y--#';

    expectObservable(e1.dematerialize()).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should dematerialize stream does not completes', function () {
    var e1 =   hot('------');
    var e1subs =   '^';
    var expected = '-';

    expectObservable(e1.dematerialize()).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should dematerialize stream never completes', function () {
    var e1 =  cold('-');
    var e1subs =   '^';
    var expected = '-';

    expectObservable(e1.dematerialize()).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should dematerialize stream does not emit', function () {
    var e1 =   hot('----|');
    var e1subs =   '^   !';
    var expected = '----|';

    expectObservable(e1.dematerialize()).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should dematerialize empty stream', function () {
    var e1 =  cold('|');
    var e1subs =   '(^!)';
    var expected = '|';

    expectObservable(e1.dematerialize()).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should dematerialize stream throws', function () {
    var error = 'error';
    var e1 =   hot('(x|)', {x: Notification.createError(error)});
    var e1subs =   '(^!)';
    var expected = '#';

    expectObservable(e1.dematerialize()).toBe(expected, null, error);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should dematerialize and completes when stream compltes with complete notification', function () {
    var e1 =   hot('----(a|)', { a: Notification.createComplete() });
    var e1subs =   '^   !';
    var expected = '----|';

    expectObservable(e1.dematerialize()).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should dematerialize and completes when stream emits complete notification', function () {
    var e1 =   hot('----a--|', { a: Notification.createComplete() });
    var e1subs =   '^   !';
    var expected = '----|';

    expectObservable(e1.dematerialize()).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });
});