/* globals describe, it, expect, expectObservable, expectSubscriptions, hot, cold, rxTestScheduler */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.prototype.concat()', function () {
  it.asDiagram('concat')('should concatenate two cold observables', function () {
    var e1 =   cold('--a--b-|');
    var e2 =   cold(       '--x---y--|');
    var expected =  '--a--b---x---y--|';

    expectObservable(e1.concat(e2, rxTestScheduler)).toBe(expected);
  });

  it('should complete without emit if both sources are empty', function () {
    var e1 =   cold('--|');
    var e1subs =    '^ !';
    var e2 =   cold(  '----|');
    var e2subs =    '  ^   !';
    var expected =  '------|';

    expectObservable(e1.concat(e2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should not complete if first source does not completes', function () {
    var e1 =   cold('-');
    var e1subs =    '^';
    var e2 =   cold('--|');
    var e2subs = [];
    var expected =  '-';

    expectObservable(e1.concat(e2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should not complete if second source does not completes', function () {
    var e1 =   cold('--|');
    var e1subs =    '^ !';
    var e2 =   cold('---');
    var e2subs =    '  ^';
    var expected =  '---';

    expectObservable(e1.concat(e2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should not complete if both sources do not complete', function () {
    var e1 =   cold('-');
    var e1subs =    '^';
    var e2 =   cold('-');
    var e2subs = [];
    var expected =  '-';

    expectObservable(e1.concat(e2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should raise error when first source is empty, second source raises error', function () {
    var e1 =   cold('--|');
    var e1subs =    '^ !';
    var e2 =   cold(  '----#');
    var e2subs =    '  ^   !';
    var expected =  '------#';

    expectObservable(e1.concat(e2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should raise error when first source raises error, second source is empty', function () {
    var e1 =   cold('---#');
    var e1subs =    '^  !';
    var e2 =   cold('----|');
    var e2subs = [];
    var expected =  '---#';

    expectObservable(e1.concat(e2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should raise first error when both source raise error', function () {
    var e1 =   cold('---#');
    var e1subs =    '^  !';
    var e2 =   cold('------#');
    var e2subs = [];
    var expected =  '---#';

    expectObservable(e1.concat(e2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should concat if first source emits once, second source is empty', function () {
    var e1 =   cold('--a--|');
    var e1subs =    '^    !';
    var e2 =   cold(     '--------|');
    var e2subs =    '     ^       !';
    var expected =  '--a----------|';

    expectObservable(e1.concat(e2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should concat if first source is empty, second source emits once', function () {
    var e1 =   cold('--|');
    var e1subs =    '^ !';
    var e2 =   cold(  '--a--|');
    var e2subs =    '  ^    !';
    var expected =  '----a--|';

    expectObservable(e1.concat(e2)).toBe(expected);
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

    expectObservable(e1.concat(e2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should not complete if first source does not complete', function () {
    var e1 =   cold('-');
    var e1subs =    '^';
    var e2 =   cold('--a--|');
    var e2subs = [];
    var expected =  '-';

    expectObservable(e1.concat(e2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should emit elements from each source when source emit once', function () {
    var e1 =   cold('---a|');
    var e1subs =    '^   !';
    var e2 =   cold(    '-----b--|');
    var e2subs =    '    ^       !';
    var expected =  '---a-----b--|';

    expectObservable(e1.concat(e2)).toBe(expected);
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

    expectObservable(e1.concat(e2), unsub).toBe(expected);
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

    var result = e1
      .mergeMap(function (x) { return Observable.of(x); })
      .concat(e2)
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

    expectObservable(e1.concat(e2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should emit element from first source then raise error from second source', function () {
    var e1 =   cold('--a--|');
    var e1subs =    '^    !';
    var e2 =   cold(     '-------#');
    var e2subs =    '     ^      !';
    var expected =  '--a---------#';

    expectObservable(e1.concat(e2)).toBe(expected);
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

    expectObservable(e1.concat(e2)).toBe(expected);
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

    expectObservable(e1.concat(e2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should not emit collapsing element from second source', function () {
    var e1 =   hot('--a--b--c--|');
    var e1subs =   '^          !';
    var e2 =   hot('--------x--y--z--|');
    var e2subs =   '           ^     !';
    var expected = '--a--b--c--y--z--|';

    expectObservable(e1.concat(e2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should accept scheduler with multiple observables', function () {
    var e1 =   cold('---a|');
    var e1subs =    '^   !';
    var e2 =   cold(    '---b--|');
    var e2subs =    '    ^     !';
    var e3 =   cold(          '---c--|');
    var e3subs =    '          ^     !';
    var expected =  '---a---b-----c--|';

    expectObservable(e1.concat(e2, e3, rxTestScheduler)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
    expectSubscriptions(e3.subscriptions).toBe(e3subs);
  });

  it('should accept scheduler without observable parameters', function () {
    var e1 =   cold('---a-|');
    var e1subs =    '^    !';
    var expected =  '---a-|';

    expectObservable(e1.concat(rxTestScheduler)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should emit self without parameters', function () {
    var e1 =   cold('---a-|');
    var e1subs =    '^    !';
    var expected =  '---a-|';

    expectObservable(e1.concat()).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not break unsubscription chain when unsubscribed explicitly', function () {
    var e1 =   cold('---a-a--a|            ');
    var e1subs =    '^        !            ';
    var e2 =   cold(         '-----b-b--b-|');
    var e2subs =    '         ^       !    ';
    var unsub =     '                 !    ';
    var expected =  '---a-a--a-----b-b     ';

    var r = e1
      .mergeMap(function (x) { return Observable.of(x); })
      .concat(e2)
      .mergeMap(function (x) { return Observable.of(x); });

    expectObservable(r, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });
});
