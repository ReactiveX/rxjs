/* globals describe, it, expect, hot, cold, expectObservable, expectSubscriptions, rxTestScheduler */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;
var queueScheduler = Rx.Scheduler.queue;

describe('Observable.prototype.merge', function () {
  it.asDiagram('merge')('should handle merging two hot observables', function () {
    var e1 =    hot('--a-----b-----c----|');
    var e1subs =    '^                  !';
    var e2 =    hot('-----d-----e-----f---|');
    var e2subs =    '^                    !';
    var expected =  '--a--d--b--e--c--f---|';

    var result = e1.merge(e2, rxTestScheduler);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should merge a source with a second', function (done) {
    var a = Observable.of(1, 2, 3);
    var b = Observable.of(4, 5, 6, 7, 8);
    var r = [1, 2, 3, 4, 5, 6, 7, 8];
    var i = 0;
    a.merge(b).subscribe(function (val) {
      expect(val).toBe(r[i++]);
    }, null, done);
  });

  it('should merge an immediately-scheduled source with an immediately-scheduled second', function (done) {
    var a = Observable.of(1, 2, 3, queueScheduler);
    var b = Observable.of(4, 5, 6, 7, 8, queueScheduler);
    var r = [1, 2, 4, 3, 5, 6, 7, 8];
    var i = 0;
    a.merge(b, queueScheduler).subscribe(function (val) {
      expect(val).toBe(r[i++]);
    }, null, done);
  });

  it('should merge cold and cold', function () {
    var e1 =  cold('---a-----b-----c----|');
    var e1subs =   '^                   !';
    var e2 =  cold('------x-----y-----z----|');
    var e2subs =   '^                      !';
    var expected = '---a--x--b--y--c--z----|';

    var result = e1.merge(e2, rxTestScheduler);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should merge hot and hot', function () {
    var e1 =  hot('---a---^-b-----c----|');
    var e1subs =         '^            !';
    var e2 =  hot('-----x-^----y-----z----|');
    var e2subs =         '^               !';
    var expected =       '--b--y--c--z----|';

    var result = e1.merge(e2, rxTestScheduler);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should merge hot and cold', function () {
    var e1 =  hot('---a-^---b-----c----|');
    var e1subs =       '^              !';
    var e2 =  cold(    '--x-----y-----z----|');
    var e2subs =       '^                  !';
    var expected =     '--x-b---y-c---z----|';

    var result = e1.merge(e2, rxTestScheduler);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should merge parallel emissions', function () {
    var e1 =   hot('---a----b----c----|');
    var e1subs =   '^                 !';
    var e2 =   hot('---x----y----z----|');
    var e2subs =   '^                 !';
    var expected = '---(ax)-(by)-(cz)-|';

    var result = e1.merge(e2, rxTestScheduler);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should allow unsubscribing explicitly and early', function () {
    var e1 =    hot('--a-----b-----c----|  ');
    var e1subs =    '^         !           ';
    var e2 =    hot('-----d-----e-----f---|');
    var e2subs =    '^         !           ';
    var expected =  '--a--d--b--           ';
    var unsub =     '          !           ';

    var result = e1.merge(e2, rxTestScheduler);

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', function () {
    var e1 =    hot('--a-----b-----c----|  ');
    var e1subs =    '^         !           ';
    var e2 =    hot('-----d-----e-----f---|');
    var e2subs =    '^         !           ';
    var expected =  '--a--d--b--           ';
    var unsub =     '          !           ';

    var result = e1
      .map(function (x) { return x; })
      .merge(e2, rxTestScheduler)
      .map(function (x) { return x; });

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should merge empty and empty', function () {
    var e1 = cold('|');
    var e1subs = '(^!)';
    var e2 = cold('|');
    var e2subs = '(^!)';

    var result = e1.merge(e2, rxTestScheduler);

    expectObservable(result).toBe('|');
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should merge three empties', function () {
    var e1 = cold('|');
    var e1subs = '(^!)';
    var e2 = cold('|');
    var e2subs = '(^!)';
    var e3 = cold('|');
    var e3subs = '(^!)';

    var result = e1.merge(e2, e3, rxTestScheduler);

    expectObservable(result).toBe('|');
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
    expectSubscriptions(e3.subscriptions).toBe(e3subs);
  });

  it('should merge never and empty', function () {
    var e1 = cold('-');
    var e1subs =  '^';
    var e2 = cold('|');
    var e2subs =  '(^!)';

    var result = e1.merge(e2, rxTestScheduler);

    expectObservable(result).toBe('-');
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should merge never and never', function () {
    var e1 = cold('-');
    var e1subs =  '^';
    var e2 = cold('-');
    var e2subs =  '^';

    var result = e1.merge(e2, rxTestScheduler);

    expectObservable(result).toBe('-');
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should merge empty and throw', function () {
    var e1 = cold('|');
    var e1subs =  '(^!)';
    var e2 = cold('#');
    var e2subs =  '(^!)';

    var result = e1.merge(e2, rxTestScheduler);

    expectObservable(result).toBe('#');
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should merge hot and throw', function () {
    var e1 = hot( '--a--b--c--|');
    var e1subs =  '(^!)';
    var e2 = cold('#');
    var e2subs =  '(^!)';

    var result = e1.merge(e2, rxTestScheduler);

    expectObservable(result).toBe('#');
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should merge never and throw', function () {
    var e1 = cold('-');
    var e1subs =  '(^!)';
    var e2 = cold('#');
    var e2subs =  '(^!)';

    var result = e1.merge(e2, rxTestScheduler);

    expectObservable(result).toBe('#');
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should merge empty and eventual error', function () {
    var e1 = cold(  '|');
    var e1subs =    '(^!)    ';
    var e2 =    hot('-------#');
    var e2subs =    '^      !';
    var expected =  '-------#';

    var result = e1.merge(e2, rxTestScheduler);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should merge hot and error', function () {
    var e1 =   hot('--a--b--c--|');
    var e1subs =   '^      !    ';
    var e2 =   hot('-------#    ');
    var e2subs =   '^      !    ';
    var expected = '--a--b-#    ';

    var result = e1.merge(e2, rxTestScheduler);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should merge never and error', function () {
    var e1 = hot(   '-');
    var e1subs =    '^      !';
    var e2 =    hot('-------#');
    var e2subs =    '^      !';
    var expected =  '-------#';

    var result = e1.merge(e2, rxTestScheduler);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });
});

describe('Observable.prototype.mergeAll', function () {
  it('should merge two observables', function (done) {
    var a = Observable.of(1, 2, 3);
    var b = Observable.of(4, 5, 6, 7, 8);
    var r = [1, 2, 3, 4, 5, 6, 7, 8];
    var i = 0;
    Observable.of(a, b).mergeAll().subscribe(function (val) {
      expect(val).toBe(r[i++]);
    }, null, done);
  });

  it('should merge two immediately-scheduled observables', function (done) {
    var a = Observable.of(1, 2, 3, queueScheduler);
    var b = Observable.of(4, 5, 6, 7, 8, queueScheduler);
    var r = [1, 2, 4, 3, 5, 6, 7, 8];
    var i = 0;
    Observable.of(a, b, queueScheduler).mergeAll().subscribe(function (val) {
      expect(val).toBe(r[i++]);
    }, null, done);
  });
});