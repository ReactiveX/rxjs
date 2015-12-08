/* globals describe, it, expect, hot, cold, expectObservable, expectSubscriptions */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;
var queueScheduler = Rx.Scheduler.queue;

describe('Observable.prototype.switchMap()', function () {
  it('should switch with a selector function', function (done) {
    var a = Observable.of(1, 2, 3);
    var expected = ['a1', 'b1', 'c1', 'a2', 'b2', 'c2', 'a3', 'b3', 'c3'];
    a.switchMap(function (x) {
      return Observable.of('a' + x, 'b' + x, 'c' + x);
    }).subscribe(function (x) {
      expect(x).toBe(expected.shift());
    }, null, done);
  });

  it('should unsub inner observables', function () {
    var unsubbed = [];

    Observable.of('a', 'b').switchMap(function (x) {
      return Observable.create(function (subscriber) {
        subscriber.complete();
        return function () {
          unsubbed.push(x);
        };
      });
    }).subscribe();

    expect(unsubbed).toEqual(['a', 'b']);
  });

  it('should switch inner cold observables', function () {
    var x =   cold(         '--a--b--c--d--e--|           ');
    var xsubs =    '         ^         !                  ';
    var y =   cold(                   '---f---g---h---i--|');
    var ysubs =    '                   ^                 !';
    var e1 =   hot('---------x---------y---------|        ');
    var e1subs =   '^                                    !';
    var expected = '-----------a--b--c----f---g---h---i--|';

    var observableLookup = { x: x, y: y };

    var result = e1.switchMap(function (value) {
      return observableLookup[value];
    });

    expectObservable(result).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should raise error when projection throws', function () {
    var e1 =   hot('-------x-----y---|');
    var e1subs =   '^      !          ';
    var expected = '-------#          ';
    function project() {
      throw 'error';
    }

    expectObservable(e1.switchMap(project)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should raise error when resultSelector throws', function () {
    var x =   cold(         '--a--b--c--d--e--|   ');
    var xsubs =    '         ^ !                  ';
    var e1 =   hot('---------x---------y---------|');
    var e1subs =   '^          !                  ';
    var expected = '-----------#                  ';

    function selector() {
      throw 'error';
    }

    var result = e1.switchMap(function (value) {
      return x;
    }, selector);

    expectObservable(result).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should switch inner cold observables, outer is unsubscribed early', function () {
    var x =   cold(         '--a--b--c--d--e--|           ');
    var xsubs =    '         ^         !                  ';
    var y =   cold(                   '---f---g---h---i--|');
    var ysubs =    '                   ^ !                ';
    var e1 =   hot('---------x---------y---------|        ');
    var e1subs =   '^                    !                ';
    var unsub =    '                     !                ';
    var expected = '-----------a--b--c----                ';

    var observableLookup = { x: x, y: y };

    var result = e1.switchMap(function (value) {
      return observableLookup[value];
    });

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', function () {
    var x =   cold(         '--a--b--c--d--e--|           ');
    var xsubs =    '         ^         !                  ';
    var y =   cold(                   '---f---g---h---i--|');
    var ysubs =    '                   ^ !                ';
    var e1 =   hot('---------x---------y---------|        ');
    var e1subs =   '^                    !                ';
    var expected = '-----------a--b--c----                ';
    var unsub =    '                     !                ';

    var observableLookup = { x: x, y: y };

    var result = e1
      .mergeMap(function (x) { return Observable.of(x); })
      .switchMap(function (value) { return observableLookup[value]; })
      .mergeMap(function (x) { return Observable.of(x); });

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should switch inner cold observables, inner never completes', function () {
    var x =   cold(         '--a--b--c--d--e--|          ');
    var xsubs =    '         ^         !                 ';
    var y =   cold(                   '---f---g---h---i--');
    var ysubs =    '                   ^                 ';
    var e1 =   hot('---------x---------y---------|       ');
    var e1subs =   '^                                    ';
    var expected = '-----------a--b--c----f---g---h---i--';

    var observableLookup = { x: x, y: y };

    var result = e1.switchMap(function (value) {
      return observableLookup[value];
    });

    expectObservable(result).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle a synchronous switch to the second inner observable', function () {
    var x =   cold(         '--a--b--c--d--e--|   ');
    var xsubs =    '         (^!)                 ';
    var y =   cold(         '---f---g---h---i--|  ');
    var ysubs =    '         ^                 !  ';
    var e1 =   hot('---------(xy)----------------|');
    var e1subs =   '^                            !';
    var expected = '------------f---g---h---i----|';

    var observableLookup = { x: x, y: y };

    var result = e1.switchMap(function (value) {
      return observableLookup[value];
    });

    expectObservable(result).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should switch inner cold observables, one inner throws', function () {
    var x =   cold(         '--a--b--#--d--e--|          ');
    var xsubs =    '         ^       !                   ';
    var y =   cold(                   '---f---g---h---i--');
    var ysubs = [];
    var e1 =   hot('---------x---------y---------|       ');
    var e1subs =   '^                !                   ';
    var expected = '-----------a--b--#                   ';

    var observableLookup = { x: x, y: y };

    var result = e1.switchMap(function (value) {
      return observableLookup[value];
    });

    expectObservable(result).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should switch inner hot observables', function () {
    var x =    hot('-----a--b--c--d--e--|                 ');
    var xsubs =    '         ^         !                  ';
    var y =    hot('--p-o-o-p-------------f---g---h---i--|');
    var ysubs =    '                   ^                 !';
    var e1 =   hot('---------x---------y---------|        ');
    var e1subs =   '^                                    !';
    var expected = '-----------c--d--e----f---g---h---i--|';

    var observableLookup = { x: x, y: y };

    var result = e1.switchMap(function (value) {
      return observableLookup[value];
    });

    expectObservable(result).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should switch inner empty and empty', function () {
    var x = cold('|');
    var y = cold('|');
    var xsubs =    '         (^!)                 ';
    var ysubs =    '                   (^!)       ';
    var e1 =   hot('---------x---------y---------|');
    var e1subs =   '^                            !';
    var expected = '-----------------------------|';

    var observableLookup = { x: x, y: y };

    var result = e1.switchMap(function (value) {
      return observableLookup[value];
    });

    expectObservable(result).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should switch inner empty and never', function () {
    var x = cold('|');
    var y = cold('-');
    var xsubs =    '         (^!)                 ';
    var ysubs =    '                   ^          ';
    var e1 =   hot('---------x---------y---------|');
    var e1subs =   '^                             ';
    var expected = '------------------------------';

    var observableLookup = { x: x, y: y };

    var result = e1.switchMap(function (value) {
      return observableLookup[value];
    });

    expectObservable(result).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should switch inner never and empty', function () {
    var x = cold('-');
    var y = cold('|');
    var xsubs =    '         ^         !          ';
    var ysubs =    '                   (^!)       ';
    var e1 =   hot('---------x---------y---------|');
    var e1subs =   '^                            !';
    var expected = '-----------------------------|';

    var observableLookup = { x: x, y: y };

    var result = e1.switchMap(function (value) {
      return observableLookup[value];
    });

    expectObservable(result).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should switch inner never and throw', function () {
    var x = cold('-');
    var y = cold('#', null, 'sad');
    var xsubs =    '         ^         !          ';
    var ysubs =    '                   (^!)       ';
    var e1 =   hot('---------x---------y---------|');
    var e1subs =   '^                  !          ';
    var expected = '-------------------#          ';

    var observableLookup = { x: x, y: y };

    var result = e1.switchMap(function (value) {
      return observableLookup[value];
    });

    expectObservable(result).toBe(expected, undefined, 'sad');
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should switch inner empty and throw', function () {
    var x = cold('|');
    var y = cold('#', null, 'sad');
    var xsubs =    '         (^!)                 ';
    var ysubs =    '                   (^!)       ';
    var e1 =   hot('---------x---------y---------|');
    var e1subs =   '^                  !          ';
    var expected = '-------------------#          ';

    var observableLookup = { x: x, y: y };

    var result = e1.switchMap(function (value) {
      return observableLookup[value];
    });

    expectObservable(result).toBe(expected, undefined, 'sad');
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle outer empty', function () {
    var e1 =  cold('|');
    var e1subs =   '(^!)';
    var expected = '|';

    var result = e1.switchMap(function (value) {
      return Observable.of(value);
    });

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle outer never', function () {
    var e1 =  cold('-');
    var e1subs =   '^';
    var expected = '-';

    var result = e1.switchMap(function (value) {
      return Observable.of(value);
    });

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle outer throw', function () {
    var e1 =  cold('#');
    var e1subs =   '(^!)';
    var expected = '#';

    var result = e1.switchMap(function (value) {
      return Observable.of(value);
    });

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle outer error', function () {
    var x =   cold(         '--a--b--c--d--e--|');
    var xsubs =    '         ^         !       ';
    var e1 =   hot('---------x---------#       ');
    var e1subs =   '^                  !       ';
    var expected = '-----------a--b--c-#       ';

    var observableLookup = { x: x };

    var result = e1.switchMap(function (value) {
      return observableLookup[value];
    });

    expectObservable(result).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should switch with resultSelector goodness', function () {
    var x =   cold(         '--a--b--c--d--e--|           ');
    var xsubs =    '         ^         !                  ';
    var y =   cold(                   '---f---g---h---i--|');
    var ysubs =    '                   ^                 !';
    var e1 =   hot('---------x---------y---------|        ');
    var e1subs =   '^                                    !';
    var expected = '-----------a--b--c----f---g---h---i--|';

    var observableLookup = { x: x, y: y };

    var expectedValues = {
      a: ['x', 'a', 0, 0],
      b: ['x', 'b', 0, 1],
      c: ['x', 'c', 0, 2],
      f: ['y', 'f', 1, 0],
      g: ['y', 'g', 1, 1],
      h: ['y', 'h', 1, 2],
      i: ['y', 'i', 1, 3]
    };

    var result = e1.switchMap(function (value) {
      return observableLookup[value];
    }, function (innerValue, outerValue, innerIndex, outerIndex) {
      return [innerValue, outerValue, innerIndex, outerIndex];
    });

    expectObservable(result).toBe(expected, expectedValues);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });
});