/* globals describe, it, expect, expectObservable, hot, cold, rxTestScheduler */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.prototype.repeat()', function () {
  it('should resubscribe count number of times', function () {
    var e1 =   cold('--a--b--|                ');
    var subs =     ['^       !                ',
                    '        ^       !        ',
                    '                ^       !'];
    var expected =  '--a--b----a--b----a--b--|';

    expectObservable(e1.repeat(3)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should resubscribe multiple times', function () {
    var e1 =   cold('--a--b--|                        ');
    var subs =     ['^       !                        ',
                    '        ^       !                ',
                    '                ^       !        ',
                    '                        ^       !'];
    var expected =  '--a--b----a--b----a--b----a--b--|';

    expectObservable(e1.repeat(2).repeat(2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should complete without emit when count is zero', function () {
    var e1 =  cold('--a--b--|');
    var subs = [];
    var expected = '|';

    expectObservable(e1.repeat(0)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should emit source once when count is one', function () {
    var e1 =  cold('--a--b--|');
    var subs =     '^       !';
    var expected = '--a--b--|';

    expectObservable(e1.repeat(1)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should repeat until gets unsubscribed', function () {
    var e1 =  cold('--a--b--|      ');
    var subs =    ['^       !      ',
                   '        ^     !'];
    var unsub =    '              !';
    var expected = '--a--b----a--b-';

    expectObservable(e1.repeat(10), unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should be able to repeat indefinitely until unsubscribed', function () {
    var e1 =  cold('--a--b--|                                    ');
    var subs =    ['^       !                                    ',
                   '        ^       !                            ',
                   '                ^       !                    ',
                   '                        ^       !            ',
                   '                                ^       !    ',
                   '                                        ^   !'];
    var unsub =    '                                            !';
    var expected = '--a--b----a--b----a--b----a--b----a--b----a--';

    expectObservable(e1.repeat(), unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should consider negative count as repeat indefinitely', function () {
    var e1 =  cold('--a--b--|                                    ');
    var subs =    ['^       !                                    ',
                   '        ^       !                            ',
                   '                ^       !                    ',
                   '                        ^       !            ',
                   '                                ^       !    ',
                   '                                        ^   !'];
    var unsub =    '                                            !';
    var expected = '--a--b----a--b----a--b----a--b----a--b----a--';

    expectObservable(e1.repeat(-1), unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should not complete when source never completes', function () {
    var e1 = Observable.never();
    var expected = '-';

    expectObservable(e1.repeat(3)).toBe(expected);
  });

  it('should not complete when source does not completes', function () {
    var e1 =  cold('-');
    var unsub =    '                              !';
    var subs =     '^                             !';
    var expected = '-';

    expectObservable(e1.repeat(3), unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should complete immediately when source does not complete without emit but count is zero', function () {
    var e1 =  cold('-');
    var subs = [];
    var expected = '|';

    expectObservable(e1.repeat(0)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should complete immediately when source does not complete but count is zero', function () {
    var e1 =   cold('--a--b--');
    var subs = [];
    var expected = '|';

    expectObservable(e1.repeat(0)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should emit source once and does not complete when source emits but does not complete', function () {
    var e1 =   cold('--a--b--');
    var subs =     ['^       '];
    var expected =  '--a--b--';

    expectObservable(e1.repeat(3)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should complete when source is empty', function () {
    var e1 = Observable.empty();
    var expected = '|';

    expectObservable(e1.repeat(3)).toBe(expected);
  });

  it('should complete when source does not emit', function () {
    var e1 =  cold('----|        ');
    var subs =    ['^   !        ',
                   '    ^   !    ',
                   '        ^   !'];
    var expected = '------------|';

    expectObservable(e1.repeat(3)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should complete immediately when source does not emit but count is zero', function () {
    var e1 =  cold('----|');
    var subs = [];
    var expected = '|';

    expectObservable(e1.repeat(0)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should raise error when source raises error', function () {
    var e1 =  cold('--a--b--#');
    var subs =     '^       !';
    var expected = '--a--b--#';

    expectObservable(e1.repeat(2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should raises error if source throws', function () {
    var e1 = Observable.throw('error');
    var expected = '#';

    expectObservable(e1.repeat(3)).toBe(expected);
  });

  it('should raises error if source throws when repeating infinitely', function () {
    var e1 = Observable.throw('error');
    var expected = '#';

    expectObservable(e1.repeat(3)).toBe(expected);
  });

  it('should terminate repeat and throw if source subscription to _next throws', function () {
    var e1 = Observable.of(1, 2, rxTestScheduler);
    e1.subscribe(function () { throw new Error('error'); });

    expect(function () {
      e1.repeat(3);
      rxTestScheduler.flush();
    }).toThrow();
  });

  it('should terminate repeat and throw if source subscription to _complete throws', function () {
    var e1 = Observable.of(1, 2, rxTestScheduler);
    e1.subscribe(function () {}, function () {}, function () { throw new Error('error'); });

    expect(function () {
      e1.repeat(3);
      rxTestScheduler.flush();
    }).toThrow();
  });

  it('should terminate repeat and throw if source subscription to _next throws when repeating infinitely', function () {
    var e1 = Observable.of(1, 2, rxTestScheduler);
    e1.subscribe(function () { throw new Error('error'); });

    expect(function () {
      e1.repeat();
      rxTestScheduler.flush();
    }).toThrow();
  });

  it('should terminate repeat and throw if source subscription to _complete throws when repeating infinitely', function () {
    var e1 = Observable.of(1, 2, rxTestScheduler);
    e1.subscribe(function () {}, function () {}, function () { throw new Error('error'); });

    expect(function () {
      e1.repeat();
      rxTestScheduler.flush();
    }).toThrow();
  });
});