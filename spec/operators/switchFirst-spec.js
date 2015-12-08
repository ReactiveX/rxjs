/* globals describe, it, expect, hot, cold, expectObservable, expectSubscriptions */
var Rx = require('../../dist/cjs/Rx');
var Promise = require('promise');

var Observable = Rx.Observable;
var queueScheduler = Rx.Scheduler.queue;

describe('Observable.prototype.switchFirst()', function () {
  it('should switch to first immediately-scheduled inner Observable', function () {
    var e1 = cold( '(ab|)');
    var e1subs =   '(^!)';
    var e2 = cold( '(cd|)');
    var e2subs = [];
    var expected = '(ab|)';

    expectObservable(Observable.of(e1, e2).switchFirst()).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should handle throw', function () {
    var e1 =  cold('#');
    var e1subs =   '(^!)';
    var expected = '#';

    expectObservable(e1.switchFirst()).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle empty', function () {
    var e1 =  cold('|');
    var e1subs =   '(^!)';
    var expected = '|';

    expectObservable(e1.switchFirst()).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle never', function () {
    var e1 =  cold('-');
    var e1subs =   '^';
    var expected = '-';

    expectObservable(e1.switchFirst()).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle a hot observable of observables', function () {
    var x = cold(        '--a---b---c--|               ');
    var xsubs =    '      ^            !               ';
    var y = cold(                '---d--e---f---|      ');
    var ysubs = [];
    var z = cold(                      '---g--h---i---|');
    var zsubs =    '                    ^             !';
    var e1 = hot(  '------x-------y-----z-------------|', { x: x, y: y, z: z });
    var expected = '--------a---b---c------g--h---i---|';

    expectObservable(e1.switchFirst()).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(z.subscriptions).toBe(zsubs);
  });

  it('should handle a hot observable of observables, outer is unsubscribed early', function () {
    var x = cold(        '--a---b---c--|         ');
    var xsubs =    '      ^         !           ';
    var y = cold(                '---d--e---f---|');
    var ysubs = [];
    var e1 = hot(  '------x-------y------|       ', { x: x, y: y });
    var unsub =    '                !            ';
    var expected = '--------a---b---             ';

    expectObservable(e1.switchFirst(), unsub).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', function () {
    var x = cold(        '--a---b---c--|         ');
    var xsubs =    '      ^         !           ';
    var y = cold(                '---d--e---f---|');
    var ysubs = [];
    var e1 = hot(  '------x-------y------|       ', { x: x, y: y });
    var unsub =    '                !            ';
    var expected = '--------a---b----            ';

    var result = e1
      .mergeMap(function (i) { return Observable.of(i); })
      .switchFirst()
      .mergeMap(function (i) { return Observable.of(i); });

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
  });

  it('should handle a hot observable of observables, inner never completes', function () {
    var x = cold(     '--a---b--|              ');
    var xsubs =    '   ^        !              ';
    var y = cold(          '-d---e-            ');
    var ysubs = [];
    var z = cold(                '---f--g---h--');
    var zsubs =    '              ^            ';
    var e1 = hot(  '---x---y------z----------| ', { x: x, y: y, z: z });
    var expected = '-----a---b-------f--g---h--';

    expectObservable(e1.switchFirst()).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(z.subscriptions).toBe(zsubs);
  });

  it('should handle a synchronous switch and stay on the first inner observable', function () {
    var x = cold(        '--a---b---c--|   ');
    var xsubs =    '      ^            !   ';
    var y = cold(        '---d--e---f---|  ');
    var ysubs = [];
    var e1 = hot(  '------(xy)------------|', { x: x, y: y });
    var expected = '--------a---b---c-----|';

    expectObservable(e1.switchFirst()).toBe(expected);
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

    expectObservable(e1.switchFirst()).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
  });

  it('should handle a hot observable of observables, outer throws', function () {
    var x = cold(        '--a---b---c--|         ');
    var xsubs =    '      ^            !         ';
    var y = cold(                '---d--e---f---|');
    var ysubs = [];
    var e1 = hot(  '------x-------y-------#      ', { x: x, y: y });
    var expected = '--------a---b---c-----#      ';

    expectObservable(e1.switchFirst()).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
  });

  it('should handle an empty hot observable', function () {
    var e1 = hot(  '------|');
    var e1subs =   '^     !';
    var expected = '------|';

    expectObservable(e1.switchFirst()).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle a never hot observable', function () {
    var e1 =   hot('-');
    var e1subs =   '^';
    var expected = '-';

    expectObservable(e1.switchFirst()).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should complete not before the outer completes', function () {
    var x = cold(        '--a---b---c--|   ');
    var xsubs =    '      ^            !   ';
    var e1 = hot(  '------x---------------|', { x: x });
    var expected = '--------a---b---c-----|';

    expectObservable(e1.switchFirst()).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
  });

  it('should handle an observable of promises', function (done) {
    var expected = [1];

    Observable.of(Promise.resolve(1), Promise.resolve(2), Promise.resolve(3))
      .switchFirst()
      .subscribe(function (x) {
        expect(x).toBe(expected.shift());
      }, null, function () {
        expect(expected.length).toBe(0);
        done();
      });
  });

  it('should handle an observable of promises, where one rejects', function (done) {
    Observable.of(Promise.reject(2), Promise.resolve(1))
      .switchFirst()
      .subscribe(function (x) {
        expect(false).toBe(true);
      }, function (err) {
        expect(err).toBe(2);
        done();
      }, function () {
        expect(false).toBe(true);
      });
  });
});
