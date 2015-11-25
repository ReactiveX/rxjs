/* globals describe, expect, it, hot, cold, expectObservable, expectSubscriptions */

var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.prototype.share()', function () {
  it('should share a single subscription', function () {
    var subscriptionCount = 0;
    var obs = new Observable(function (observer) {
      subscriptionCount++;
    });

    var source = obs.share();

    expect(subscriptionCount).toBe(0);

    source.subscribe();
    source.subscribe();

    expect(subscriptionCount).toBe(1);
  });

  it('should mirror a simple source Observable', function () {
    var source = hot('--0--^-1-2---3-4--5-|');
    var sourceSubs =      '^              !';
    var expected =        '--1-2---3-4--5-|';

    var shared = source.share();

    expectObservable(shared).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should not change the output of the observable when error', function () {
    var e1 = hot('---a--^--b--c--d--e--#');
    var e1subs =       '^              !';
    var expected =     '---b--c--d--e--#';

    expectObservable(e1.share()).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not change the output of the observable when successful with cold observable', function () {
    var e1 =  cold('---a--b--c--d--e--|');
    var e1subs =   '^                 !';
    var expected = '---a--b--c--d--e--|';

    expectObservable(e1.share()).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not change the output of the observable when error with cold observable', function () {
    var e1 =  cold('---a--b--c--d--e--#');
    var e1subs =   '^                 !';
    var expected = '---a--b--c--d--e--#';

    expectObservable(e1.share()).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should retry just fine', function () {
    var e1 =  cold('---a--b--c--d--e--#');
    var e1subs =  ['^                 !                  ',
                   '                  ^                 !'];
    var expected = '---a--b--c--d--e-----a--b--c--d--e--#';

    expectObservable(e1.share().retry(1)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should share the same values to multiple observers', function () {
    var source =     cold('-1-2-3----4-|');
    var sourceSubs =      '^           !';
    var shared = source.share();
    var subscriber1 = hot('a|           ').mergeMapTo(shared);
    var expected1   =     '-1-2-3----4-|';
    var subscriber2 = hot('    b|       ').mergeMapTo(shared);
    var expected2   =     '    -3----4-|';
    var subscriber3 = hot('        c|   ').mergeMapTo(shared);
    var expected3   =     '        --4-|';

    expectObservable(subscriber1).toBe(expected1);
    expectObservable(subscriber2).toBe(expected2);
    expectObservable(subscriber3).toBe(expected3);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should share an error from the source to multiple observers', function () {
    var source =     cold('-1-2-3----4-#');
    var sourceSubs =      '^           !';
    var shared = source.share();
    var subscriber1 = hot('a|           ').mergeMapTo(shared);
    var expected1   =     '-1-2-3----4-#';
    var subscriber2 = hot('    b|       ').mergeMapTo(shared);
    var expected2   =     '    -3----4-#';
    var subscriber3 = hot('        c|   ').mergeMapTo(shared);
    var expected3   =     '        --4-#';

    expectObservable(subscriber1).toBe(expected1);
    expectObservable(subscriber2).toBe(expected2);
    expectObservable(subscriber3).toBe(expected3);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should share the same values to multiple observers, ' +
  'but is unsubscribed explicitly and early', function () {
    var source =     cold('-1-2-3----4-|');
    var sourceSubs =      '^        !   ';
    var shared = source.share();
    var unsub =           '         !   ';
    var subscriber1 = hot('a|           ').mergeMapTo(shared);
    var expected1   =     '-1-2-3----   ';
    var subscriber2 = hot('    b|       ').mergeMapTo(shared);
    var expected2   =     '    -3----   ';
    var subscriber3 = hot('        c|   ').mergeMapTo(shared);
    var expected3   =     '        --   ';

    expectObservable(subscriber1, unsub).toBe(expected1);
    expectObservable(subscriber2, unsub).toBe(expected2);
    expectObservable(subscriber3, unsub).toBe(expected3);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should share an empty source', function () {
    var source = cold('|');
    var sourceSubs =  '(^!)';
    var shared = source.share();
    var expected =    '|';

    expectObservable(shared).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should share a never source', function () {
    var source = cold('-');
    var sourceSubs =  '^';
    var shared = source.share();
    var expected =    '-';

    expectObservable(shared).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should share a throw source', function () {
    var source = cold('#');
    var sourceSubs =  '(^!)';
    var shared = source.share();
    var expected =    '#';

    expectObservable(shared).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should connect when first subscriber subscribes', function () {
    var source = cold(       '-1-2-3----4-|');
    var sourceSubs =      '   ^           !';
    var shared = source.share();
    var subscriber1 = hot('   a|           ').mergeMapTo(shared);
    var expected1 =       '   -1-2-3----4-|';
    var subscriber2 = hot('       b|       ').mergeMapTo(shared);
    var expected2 =       '       -3----4-|';
    var subscriber3 = hot('           c|   ').mergeMapTo(shared);
    var expected3 =       '           --4-|';

    expectObservable(subscriber1).toBe(expected1);
    expectObservable(subscriber2).toBe(expected2);
    expectObservable(subscriber3).toBe(expected3);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should disconnect when last subscriber unsubscribes', function () {
    var source =     cold(   '-1-2-3----4-|');
    var sourceSubs =      '   ^        !   ';
    var shared = source.share();
    var subscriber1 = hot('   a|           ').mergeMapTo(shared);
    var unsub1 =          '          !     ';
    var expected1   =     '   -1-2-3--     ';
    var subscriber2 = hot('       b|       ').mergeMapTo(shared);
    var unsub2 =          '            !   ';
    var expected2   =     '       -3----   ';

    expectObservable(subscriber1, unsub1).toBe(expected1);
    expectObservable(subscriber2, unsub2).toBe(expected2);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should be retryable when cold source is synchronous', function () {
    var source = cold('(123#)');
    var shared = source.share();
    var subscribe1 =  's         ';
    var expected1 =   '(123123#) ';
    var subscribe2 =  ' s        ';
    var expected2 =   ' (123123#)';
    var sourceSubs = ['(^!)',
                      '(^!)',
                      ' (^!)',
                      ' (^!)'];

    expectObservable(hot(subscribe1).do(function () {
      expectObservable(shared.retry(1)).toBe(expected1);
    })).toBe(subscribe1);

    expectObservable(hot(subscribe2).do(function () {
      expectObservable(shared.retry(1)).toBe(expected2);
    })).toBe(subscribe2);

    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should be repeatable when cold source is synchronous', function () {
    var source = cold('(123|)');
    var shared = source.share();
    var subscribe1 =  's         ';
    var expected1 =   '(123123|) ';
    var subscribe2 =  ' s        ';
    var expected2 =   ' (123123|)';
    var sourceSubs = ['(^!)',
                      '(^!)',
                      ' (^!)',
                      ' (^!)'];

    expectObservable(hot(subscribe1).do(function () {
      expectObservable(shared.repeat(2)).toBe(expected1);
    })).toBe(subscribe1);

    expectObservable(hot(subscribe2).do(function () {
      expectObservable(shared.repeat(2)).toBe(expected2);
    })).toBe(subscribe2);

    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should be retryable', function () {
    var source =     cold('-1-2-3----4-#                        ');
    var sourceSubs =     ['^           !                        ',
                          '            ^           !            ',
                          '                        ^           !'];
    var shared = source.share();
    var subscribe1 =      's                                    ';
    var expected1 =       '-1-2-3----4--1-2-3----4--1-2-3----4-#';
    var subscribe2 =      '    s                                ';
    var expected2 =       '    -3----4--1-2-3----4--1-2-3----4-#';

    expectObservable(hot(subscribe1).do(function () {
      expectObservable(shared.retry(2)).toBe(expected1);
    })).toBe(subscribe1);

    expectObservable(hot(subscribe2).do(function () {
      expectObservable(shared.retry(2)).toBe(expected2);
    })).toBe(subscribe2);

    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should be repeatable', function () {
    var source =     cold('-1-2-3----4-|                        ');
    var sourceSubs =     ['^           !                        ',
                          '            ^           !            ',
                          '                        ^           !'];
    var shared = source.share();
    var subscribe1 =      's                                    ';
    var expected1 =       '-1-2-3----4--1-2-3----4--1-2-3----4-|';
    var subscribe2 =      '    s                                ';
    var expected2 =       '    -3----4--1-2-3----4--1-2-3----4-|';

    expectObservable(hot(subscribe1).do(function () {
      expectObservable(shared.repeat(3)).toBe(expected1);
    })).toBe(subscribe1);

    expectObservable(hot(subscribe2).do(function () {
      expectObservable(shared.repeat(3)).toBe(expected2);
    })).toBe(subscribe2);

    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should not change the output of the observable when never', function () {
    var e1 = Observable.never();
    var expected = '-';

    expectObservable(e1.share()).toBe(expected);
  });

  it('should not change the output of the observable when empty', function () {
    var e1 = Observable.empty();
    var expected = '|';

    expectObservable(e1.share()).toBe(expected);
  });
});