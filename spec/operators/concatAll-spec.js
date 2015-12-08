/* globals describe, it, expect, expectObservable, expectSubscriptions, hot, cold */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.prototype.concatAll()', function () {
  it('should concat sources from promise', function (done) {
    var sources = Rx.Observable.fromArray([
      new Promise(function (res) { res(0); }),
      new Promise(function (res) { res(1); }),
      new Promise(function (res) { res(2); }),
      new Promise(function (res) { res(3); }),
    ]);

    var res = [];
    sources.concatAll().subscribe(
      function (x) { res.push(x); },
      function (err) { done.fail('should not be called.'); },
      function () {
        expect(res).toEqual([0,1,2,3]);
        done();
      });
  }, 2000);

  it('should concat and raise error from promise', function (done) {
    var sources = Rx.Observable.fromArray([
      new Promise(function (res) { res(0); }),
      new Promise(function (res, rej) { rej(1); }),
      new Promise(function (res) { res(2); }),
      new Promise(function (res) { res(3); }),
    ]);

    var res = [];
    sources.concatAll().subscribe(
      function (x) { res.push(x); },
      function (err) {
        expect(res.length).toBe(1);
        expect(err).toBe(1);
        done();
      },
      function () { done.fail('should not be called.'); });
  }, 2000);

  it('should concat all observables in an observable', function () {
    var e1 = Rx.Observable.fromArray([
      Rx.Observable.of('a'),
      Rx.Observable.of('b'),
      Rx.Observable.of('c')
    ]);
    var expected = '(abc|)';

    expectObservable(e1.concatAll()).toBe(expected);
  });

  it('should throw if any child observable throws', function () {
    var e1 = Rx.Observable.fromArray([
      Rx.Observable.of('a'),
      Rx.Observable.throw('error'),
      Rx.Observable.of('c')
    ]);
    var expected = '(a#)';

    expectObservable(e1.concatAll()).toBe(expected);
  });

  it('should concat a hot observable of observables', function () {
    var x = cold(     'a---b---c---|');
    var y = cold(        'd---e---f---|');
    var e1 =    hot('--x--y--|', { x: x, y: y });
    var expected =  '--a---b---c---d---e---f---|';

    expectObservable(e1.concatAll()).toBe(expected);
  });

  it('should concat merging a hot observable of non-overlapped observables', function () {
    var values = {
      x: cold(       'a-b---------|'),
      y: cold(                 'c-d-e-f-|'),
      z: cold(                          'g-h-i-j-k-|')
    };

    var e1 =   hot('--x---------y--------z--------|', values);
    var expected = '--a-b---------c-d-e-f-g-h-i-j-k-|';

    expectObservable(e1.concatAll()).toBe(expected);
  });

  it('should raise error if inner observable raises error', function () {
    var values = {
      x: cold(       'a-b---------|'),
      y: cold(                 'c-d-e-f-#'),
      z: cold(                          'g-h-i-j-k-|')
    };
    var e1 =   hot('--x---------y--------z--------|', values);
    var expected = '--a-b---------c-d-e-f-#';

    expectObservable(e1.concatAll()).toBe(expected);
  });

  it('should raise error if outer observable raises error', function () {
    var values = {
      y: cold(       'a-b---------|'),
      z: cold(                 'c-d-e-f-|'),
    };
    var e1 =   hot('--y---------z---#-------------|', values);
    var expected = '--a-b---------c-#';

    expectObservable(e1.concatAll()).toBe(expected);
  });

  it('should complete without emit if both sources are empty', function () {
    var e1 =   cold('--|');
    var e1subs =    '^ !';
    var e2 =   cold(  '----|');
    var e2subs =    '  ^   !';
    var expected =  '------|';

    var result = Observable.of(e1, e2).concatAll();

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should not complete if first source does not completes', function () {
    var e1 =   cold('-');
    var e1subs =    '^';
    var e2 =   cold('--|');
    var e2subs = [];
    var expected =  '-';

    var result = Observable.of(e1, e2).concatAll();

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should not complete if second source does not completes', function () {
    var e1 =   cold('--|');
    var e1subs =    '^ !';
    var e2 =   cold('---');
    var e2subs =    '  ^';
    var expected =  '---';

    var result = Observable.of(e1, e2).concatAll();

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should not complete if both sources do not complete', function () {
    var e1 =   cold('-');
    var e1subs =    '^';
    var e2 =   cold('-');
    var e2subs = [];
    var expected =  '-';

    var result = Observable.of(e1, e2).concatAll();

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should raise error when first source is empty, second source raises error', function () {
    var e1 =   cold('--|');
    var e1subs =    '^ !';
    var e2 =   cold(  '----#');
    var e2subs =    '  ^   !';
    var expected =  '------#';

    var result = Observable.of(e1, e2).concatAll();

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should raise error when first source raises error, second source is empty', function () {
    var e1 =   cold('---#');
    var e1subs =    '^  !';
    var e2 =   cold('----|');
    var e2subs = [];
    var expected =  '---#';

    var result = Observable.of(e1, e2).concatAll();

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should raise first error when both source raise error', function () {
    var e1 =   cold('---#');
    var e1subs =    '^  !';
    var e2 =   cold('------#');
    var e2subs = [];
    var expected =  '---#';

    var result = Observable.of(e1, e2).concatAll();

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should concat if first source emits once, second source is empty', function () {
    var e1 =   cold('--a--|');
    var e1subs =    '^    !';
    var e2 =   cold(     '--------|');
    var e2subs =    '     ^       !';
    var expected =  '--a----------|';

    var result = Observable.of(e1, e2).concatAll();

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should concat if first source is empty, second source emits once', function () {
    var e1 =   cold('--|');
    var e1subs =    '^ !';
    var e2 =   cold(  '--a--|');
    var e2subs =    '  ^    !';
    var expected =  '----a--|';

    var result = Observable.of(e1, e2).concatAll();

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should emit element from first source, and should not complete if second ' +
  'source does not completes', function () {
    var e1 =   cold('--a--|');
    var e1subs =    '^    !';
    var e2 =   cold(     '-');
    var e2subs =    '     ^';
    var expected =  '--a---';

    var result = Observable.of(e1, e2).concatAll();

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should not complete if first source does not complete', function () {
    var e1 =   cold('-');
    var e1subs =    '^';
    var e2 =   cold('--a--|');
    var e2subs = [];
    var expected =  '-';

    var result = Observable.of(e1, e2).concatAll();

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should emit elements from each source when source emit once', function () {
    var e1 =   cold('---a|');
    var e1subs =    '^   !';
    var e2 =   cold(    '-----b--|');
    var e2subs =    '    ^       !';
    var expected =  '---a-----b--|';

    var result = Observable.of(e1, e2).concatAll();

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should unsubscribe to inner source if outer is unsubscribed early', function () {
    var e1 =   cold('---a-a--a|            ');
    var e1subs =    '^        !            ';
    var e2 =   cold(         '-----b-b--b-|');
    var e2subs =    '         ^       !    ';
    var unsub =     '                 !    ';
    var expected =  '---a-a--a-----b-b     ';

    var result = Observable.of(e1, e2).concatAll();

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', function () {
    var e1 =   cold('---a-a--a|            ');
    var e1subs =    '^        !            ';
    var e2 =   cold(         '-----b-b--b-|');
    var e2subs =    '         ^       !    ';
    var expected =  '---a-a--a-----b-b-    ';
    var unsub =     '                 !    ';

    var result = Observable.of(e1, e2)
      .mergeMap(function (x) { return Observable.of(x); })
      .concatAll()
      .mergeMap(function (x) { return Observable.of(x); });

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should raise error from first source and does not emit from second source', function () {
    var e1 =   cold('--#');
    var e1subs =    '^ !';
    var e2 =   cold('----a--|');
    var e2subs = [];
    var expected =  '--#';

    var result = Observable.of(e1, e2).concatAll();

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should emit element from first source then raise error from second source', function () {
    var e1 =   cold('--a--|');
    var e1subs =    '^    !';
    var e2 =   cold(     '-------#');
    var e2subs =    '     ^      !';
    var expected =  '--a---------#';

    var result = Observable.of(e1, e2).concatAll();

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should emit all elements from both hot observable sources if first source ' +
  'completes before second source starts emit', function () {
    var e1 =   hot('--a--b-|');
    var e1subs =   '^      !';
    var e2 =   hot('--------x--y--|');
    var e2subs =   '       ^      !';
    var expected = '--a--b--x--y--|';

    var result = Observable.of(e1, e2).concatAll();

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should emit elements from second source regardless of completion time ' +
  'when second source is cold observable', function () {
    var e1 =   hot('--a--b--c---|');
    var e1subs =   '^           !';
    var e2 =  cold('-x-y-z-|');
    var e2subs =   '            ^      !';
    var expected = '--a--b--c----x-y-z-|';

    var result = Observable.of(e1, e2).concatAll();

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should not emit collapsing element from second source', function () {
    var e1 =   hot('--a--b--c--|');
    var e1subs =   '^          !';
    var e2 =   hot('--------x--y--z--|');
    var e2subs =   '           ^     !';
    var expected = '--a--b--c--y--z--|';

    var result = Observable.of(e1, e2).concatAll();

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should be able to work on a different scheduler', function () {
    var e1 =   cold('---a|');
    var e1subs =    '^   !';
    var e2 =   cold(    '---b--|');
    var e2subs =    '    ^     !';
    var e3 =   cold(          '---c--|');
    var e3subs =    '          ^     !';
    var expected =  '---a---b-----c--|';

    var result = Observable.of(e1, e2, e3, rxTestScheduler).concatAll();

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
    expectSubscriptions(e3.subscriptions).toBe(e3subs);
  });

  it('should concatAll a nested observable with a single inner observable', function () {
    var e1 =   cold('---a-|');
    var e1subs =    '^    !';
    var expected =  '---a-|';

    var result = Observable.of(e1).concatAll();

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should concatAll a nested observable with a single inner observable, and a scheduler', function () {
    var e1 =   cold('---a-|');
    var e1subs =    '^    !';
    var expected =  '---a-|';

    var result = Observable.of(e1, rxTestScheduler).concatAll();

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });
});