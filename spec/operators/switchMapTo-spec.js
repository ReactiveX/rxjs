/* globals describe, it, expect, cold, hot, expectObservable, expectSubscriptions */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;
var immediateScheduler = Rx.Scheduler.immediate;

describe('Observable.prototype.switchMapTo()', function () {
  it('should switch a synchronous many outer to a synchronous many inner', function (done) {
    var a = Observable.of(1, 2, 3);
    var expected = ['a', 'b', 'c', 'a', 'b', 'c', 'a', 'b', 'c'];
    a.switchMapTo(Observable.of('a', 'b', 'c')).subscribe(function (x) {
      expect(x).toBe(expected.shift());
    }, null, done);
  });

  it('should unsub inner observables', function () {
    var unsubbed = 0;

    Observable.of('a', 'b').switchMapTo(
      Observable.create(function (subscriber) {
        subscriber.complete();
        return function () {
          unsubbed++;
        };
      })
    ).subscribe();

    expect(unsubbed).toEqual(2);
  });

  it('should switch to an inner cold observable', function () {
    var x =   cold(         '--a--b--c--d--e--|          ');
    var xsubs =   ['         ^         !                 ',
    //                                 --a--b--c--d--e--|
                   '                   ^                !'];
    var e1 =   hot('---------x---------x---------|       ');
    var e1subs =   '^                                   !';
    var expected = '-----------a--b--c---a--b--c--d--e--|';

    expectObservable(e1.switchMapTo(x)).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should switch to an inner cold observable, outer eventually throws', function () {
    var x =   cold(         '--a--b--c--d--e--|');
    var xsubs =    '         ^         !       ';
    var e1 =   hot('---------x---------#       ');
    var e1subs =   '^                  !       ';
    var expected = '-----------a--b--c-#       ';

    expectObservable(e1.switchMapTo(x)).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should switch to an inner cold observable, outer is unsubscribed early', function () {
    var x =   cold(         '--a--b--c--d--e--|   ');
    var xsubs =   ['         ^         !          ',
    //                                 --a--b--c--d--e--|
                   '                   ^  !       '];
    var e1 =   hot('---------x---------x---------|');
    var unsub =    '                      !       ';
    var e1subs =   '^                     !       ';
    var expected = '-----------a--b--c---a-       ';

    expectObservable(e1.switchMapTo(x), unsub).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', function () {
    var x =   cold(         '--a--b--c--d--e--|   ');
    var xsubs =   ['         ^         !          ',
    //                                 --a--b--c--d--e--|
                   '                   ^  !       '];
    var e1 =   hot('---------x---------x---------|');
    var e1subs =   '^                     !       ';
    var expected = '-----------a--b--c---a-       ';
    var unsub =    '                      !       ';

    var result = e1
      .mergeMap(function (x) { return Observable.of(x); })
      .switchMapTo(x)
      .mergeMap(function (x) { return Observable.of(x); });

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should switch to an inner cold observable, inner never completes', function () {
    var x =   cold(         '--a--b--c--d--e-          ');
    var xsubs =   ['         ^         !               ',
    //                                 --a--b--c--d--e-
                   '                   ^               '];
    var e1 =   hot('---------x---------y---------|     ');
    var e1subs =   '^                                  ';
    var expected = '-----------a--b--c---a--b--c--d--e-';

    expectObservable(e1.switchMapTo(x)).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle a synchronous switch to the inner observable', function () {
    var x =   cold(         '--a--b--c--d--e--|   ');
    var xsubs =   ['         (^!)                 ',
                   '         ^                !   '];
    var e1 =   hot('---------(xx)----------------|');
    var e1subs =   '^                            !';
    var expected = '-----------a--b--c--d--e-----|';

    expectObservable(e1.switchMapTo(x)).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should switch to an inner cold observable, inner raises an error', function () {
    var x =   cold(         '--a--b--#            ');
    var xsubs =    '         ^       !            ';
    var e1 =   hot('---------x---------x---------|');
    var e1subs =   '^                !            ';
    var expected = '-----------a--b--#            ';

    expectObservable(e1.switchMapTo(x)).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should switch an inner hot observable', function () {
    var x =    hot('--p-o-o-p---a--b--c--d-|      ');
    var xsubs =   ['         ^         !          ',
                   '                   ^   !      '];
    var e1 =   hot('---------x---------x---------|');
    var e1subs =   '^                            !';
    var expected = '------------a--b--c--d-------|';

    expectObservable(e1.switchMapTo(x)).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should switch to an inner empty', function () {
    var x = cold('|');
    var xsubs =   ['         (^!)                 ',
                   '                   (^!)       '];
    var e1 =   hot('---------x---------x---------|');
    var e1subs =   '^                            !';
    var expected = '-----------------------------|';

    expectObservable(e1.switchMapTo(x)).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should switch to an inner never', function () {
    var x = cold('-');
    var xsubs =   ['         ^         !          ',
                   '                   ^          '];
    var e1 =   hot('---------x---------x---------|');
    var e1subs =   '^                             ';
    var expected = '------------------------------';

    expectObservable(e1.switchMapTo(x)).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should switch to an inner that just raises an error', function () {
    var x = cold('#');
    var xsubs =    '         (^!)                 ';
    var e1 =   hot('---------x---------x---------|');
    var e1subs =   '^        !                    ';
    var expected = '---------#                    ';

    expectObservable(e1.switchMapTo(x)).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle an empty outer', function () {
    var e1 =  cold('|');
    var e1subs =   '(^!)';
    var expected = '|';

    expectObservable(e1.switchMapTo(Observable.of('foo'))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle a never outer', function () {
    var e1 =  cold('-');
    var e1subs =   '^';
    var expected = '-';

    expectObservable(e1.switchMapTo(Observable.of('foo'))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle an outer that just raises and error', function () {
    var e1 =  cold('#');
    var e1subs =   '(^!)';
    var expected = '#';

    expectObservable(e1.switchMapTo(Observable.of('foo'))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should switch with resultSelector goodness', function () {
    var x =   cold(         '--1--2--3--4--5--|          ');
    var xsubs =   ['         ^         !                 ',
    //                                 --1--2--3--4--5--|
                   '                   ^                !'];
    var e1 =   hot('---------x---------y---------|       ');
    var e1subs =   '^                                   !';
    var expected = '-----------a--b--c---d--e--f--g--h--|';
    var expectedValues = {
      a: ['x', '1', 0, 0],
      b: ['x', '2', 0, 1],
      c: ['x', '3', 0, 2],
      d: ['y', '1', 1, 0],
      e: ['y', '2', 1, 1],
      f: ['y', '3', 1, 2],
      g: ['y', '4', 1, 3],
      h: ['y', '5', 1, 4]
    };

    var result = e1.switchMapTo(x, function (a, b, ai, bi) {
      return [a, b, ai, bi];
    });

    expectObservable(result).toBe(expected, expectedValues);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should raise error when resultSelector throws', function () {
    var x =   cold(         '--1--2--3--4--5--|   ');
    var xsubs =    '         ^ !                  ';
    var e1 =   hot('---------x---------y---------|');
    var e1subs =   '^          !';
    var expected = '-----------#';

    var result = e1.switchMapTo(x, function () {
      throw 'error';
    });

    expectObservable(result).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });
});