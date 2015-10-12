/* expect, it, describe, expectObserable, hot, cold */
var Rx = require('../../dist/cjs/Rx');
var Promise = require('promise');

var Observable = Rx.Observable;
var immediateScheduler = Rx.Scheduler.immediate;

describe('Observable.prototype.switch()', function () {
  it('should switch to each immediately-scheduled inner Observable', function (done) {
    var a = Observable.of(1, 2, 3, immediateScheduler);
    var b = Observable.of(4, 5, 6, immediateScheduler);
    var r = [1, 4, 5, 6];
    var i = 0;
    Observable.of(a, b, immediateScheduler)
      .switch()
      .subscribe(function (x) {
        expect(x).toBe(r[i++]);
      }, null, done);
  });

  it('should unsub inner observables', function () {
    var unsubbed = [];

    Observable.of('a', 'b').map(function (x) {
      return Observable.create(function (subscriber) {
        subscriber.complete();
        return function () {
          unsubbed.push(x);
        };
      });
    })
    .mergeAll()
    .subscribe();

    expect(unsubbed).toEqual(['a', 'b']);
  });

  it('should switch to each inner Observable', function (done) {
    var a = Observable.of(1, 2, 3);
    var b = Observable.of(4, 5, 6);
    var r = [1, 2, 3, 4, 5, 6];
    var i = 0;
    Observable.of(a, b).switch().subscribe(function (x) {
      expect(x).toBe(r[i++]);
    }, null, done);
  });

  it('should handle a hot observable of observables', function () {
    var x = cold(        '--a---b---c--|         ');
    var xsubs =    '      ^       !              ';
    var y = cold(                '---d--e---f---|');
    var ysubs =    '              ^             !';
    var e1 = hot(  '------x-------y------|       ', { x: x, y: y });
    var expected = '--------a---b----d--e---f---|';
    expectObservable(e1.switch()).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
  });

  it('should handle a hot observable of observables, outer is unsubscribed early', function () {
    var x = cold(        '--a---b---c--|         ');
    var xsubs =    '      ^       !              ';
    var y = cold(                '---d--e---f---|');
    var ysubs =    '              ^ !            ';
    var e1 = hot(  '------x-------y------|       ', { x: x, y: y });
    var unsub =    '                !            ';
    var expected = '--------a---b---             ';
    expectObservable(e1.switch(), unsub).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
  });

  it('should handle a hot observable of observables, inner never completes', function () {
    var x = cold(        '--a---b---c--|          ');
    var xsubs =    '      ^       !               ';
    var y = cold(                '---d--e---f-----');
    var ysubs =    '              ^               ';
    var e1 = hot(  '------x-------y------|        ', { x: x, y: y });
    var expected = '--------a---b----d--e---f-----';
    expectObservable(e1.switch()).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
  });

  it('should handle a synchronous switch to the second inner observable', function () {
    var x = cold(        '--a---b---c--|   ');
    var xsubs =    '      (^!)             ';
    var y = cold(        '---d--e---f---|  ');
    var ysubs =    '      ^             !  ';
    var e1 = hot(  '------(xy)------------|', { x: x, y: y });
    var expected = '---------d--e---f-----|';
    expectObservable(e1.switch()).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
  });

  it('should handle a hot observable of observables, one inner throws', function () {
    var x = cold(        '--a---#                ');
    var xsubs =    '      ^     !                ';
    var y = cold(                '---d--e---f---|');
    var ysubs = [];
    var e1 = hot(  '------x-------y------|       ', { x: x, y: y });
    var expected = '--------a---#                ';
    expectObservable(e1.switch()).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
  });

  it('should handle a hot observable of observables, outer throws', function () {
    var x = cold(        '--a---b---c--|         ');
    var xsubs =    '      ^       !              ';
    var y = cold(                '---d--e---f---|');
    var ysubs =    '              ^       !      ';
    var e1 = hot(  '------x-------y-------#      ', { x: x, y: y });
    var expected = '--------a---b----d--e-#      ';
    expectObservable(e1.switch()).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
  });

  it('should handle an empty hot observable', function () {
    var e1 = hot(  '------|');
    var expected = '------|';
    expectObservable(e1.switch()).toBe(expected);
  });

  it('should handle a never hot observable', function () {
    var e1 = hot('-');
    var expected = '-';
    expectObservable(e1.switch()).toBe(expected);
  });

  it('should complete not before the outer completes', function () {
    var x = cold(        '--a---b---c--|   ');
    var xsubs =    '      ^            !   ';
    var e1 = hot(  '------x---------------|', { x: x });
    var expected = '--------a---b---c-----|';
    expectObservable(e1.switch()).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
  });

  it('should handle an observable of promises', function (done) {
    var expected = [3];

    Observable.of(Promise.resolve(1), Promise.resolve(2), Promise.resolve(3))
      .switch()
      .subscribe(function (x) {
        expect(x).toBe(expected.shift());
      }, null, function () {
        expect(expected.length).toBe(0);
        done();
      });
  });

  it('should handle an observable of promises, where one rejects', function (done) {
    Observable.of(Promise.resolve(1), Promise.reject(2), Promise.resolve(3))
      .switch()
      .subscribe(function (x) {
        expect(x).toBe(3);
      }, function (err) {
        expect(err).toBe(2);
      }, function () {
        done();
      });
  });

  it('should handle an observable with Arrays in it', function () {
    var expected = [1,2,3,4];
    var completed = false;

    Observable.of(Observable.never(), Observable.never(), [1,2,3,4])
      .switch()
      .subscribe(function (x) {
        expect(x).toBe(expected.shift());
      }, null, function () {
        completed = true;
        expect(expected.length).toBe(0);
      });

    expect(completed).toBe(true);
  });
});