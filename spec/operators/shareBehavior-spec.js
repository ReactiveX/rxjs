/* globals describe, it, expect, expectObservable, hot */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.prototype.shareBehavior', function () {
  it('should share a single subscription', function () {
    var subscriptionCount = 0;
    var obs = new Observable(function (observer) {
      subscriptionCount++;
    });

    var source = obs.shareBehavior(0);

    expect(subscriptionCount).toBe(0);

    source.subscribe();
    source.subscribe();
    source.subscribe();

    expect(subscriptionCount).toBe(1);
  });

  it('should replay 1 event from the past to a late subscriber', function (done) {
    var results1 = [];
    var results2 = [];
    var subscriptions = 0;

    var source = new Observable(function (observer) {
      subscriptions++;
      observer.next(1);
      observer.next(2);
      observer.next(3);
      observer.next(4);
    });

    var hot = source.shareBehavior(0);

    expect(results1).toEqual([]);
    expect(results2).toEqual([]);

    hot.subscribe(function (x) {
      results1.push(x);
    });

    expect(results1).toEqual([0, 1, 2, 3, 4]);
    expect(results2).toEqual([]);

    hot.subscribe(function (x) {
      results2.push(x);
    });

    expect(results1).toEqual([0, 1, 2, 3, 4]);
    expect(results2).toEqual([4]);
    expect(subscriptions).toBe(1);
    done();
  });

  it('should replay the default value if no next() ever emits', function (done) {
    var results1 = [];
    var results2 = [];
    var subscriptions = 0;

    var source = new Observable(function (observer) {
      subscriptions++;
    });

    var hot = source.shareBehavior(0);

    expect(results1).toEqual([]);
    expect(results2).toEqual([]);

    hot.subscribe(function (x) {
      results1.push(x);
    });

    expect(results1).toEqual([0]);
    expect(results2).toEqual([]);

    hot.subscribe(function (x) {
      results2.push(x);
    });

    expect(results1).toEqual([0]);
    expect(results2).toEqual([0]);
    expect(subscriptions).toBe(1);
    done();
  });

  it('should unsubscribe from the source as soon as no more subscribers on shared', function () {
    var e1 = cold(  '--a---b-c--d--e--|');
    var e1subs =    '^           !     ';
    var expected1 = 'x-a---b-          ';
    var unsub1 =    '       !          ';
    var expected2 = 'x-a---b-c--d-     ';
    var unsub2 =    '            !     ';

    var shared = e1.shareBehavior('x');
    var observer1 = shared.do();
    var observer2 = shared.do();

    expectObservable(observer1, unsub1).toBe(expected1);
    expectObservable(observer2, unsub2).toBe(expected2);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should give latest value to a late observer', function () {
    var e1 = cold(  '--a-b---c--d--e--|');
    var e1subs =    '^               ! ';
    var expected1 = 'x-a-b---c--d--    ';
    var unsub1 =    '             !    ';
    var e2 = cold(  '-------x----------');
    var expected2 = '       bc--d--e-- ';
    var unsub2 =    '       ^        ! ';

    var shared = e1.shareBehavior('x');
    var observer1 = shared.do();
    var observer2 = e2.mergeMap(function () { return shared.do(); });

    expectObservable(observer1, unsub1).toBe(expected1);
    expectObservable(observer2, unsub2).toBe(expected2);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not change the output of the observable when successful', function () {
    var e1 = hot('---a--^--b-c--d--e--|');
    var expected =     'x--b-c--d--e--|';

    expectObservable(e1.shareBehavior('x')).toBe(expected);
  });

  it('should not change the output of the observable when error', function () {
    var e1 = hot('---a--^--b-c--d--e--#');
    var expected =     'x--b-c--d--e--#';

    expectObservable(e1.shareBehavior('x')).toBe(expected);
  });

  it('should not change the output of the observable when never', function () {
    var e1 = cold( '----');
    var expected = 'a---';

    expectObservable(e1.shareBehavior('a')).toBe(expected);
  });

  it('should not change the output of the observable when empty', function () {
    var e1 = cold( '|   ');
    var expected = '(a|)';

    expectObservable(e1.shareBehavior('a')).toBe(expected);
  });
});