/* globals describe, it, expect, expectObservable, expectSubscriptions, hot, cold, rxTestScheduler */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.prototype.debounce()', function () {
  function getTimerSelector(x) {
    return function () {
      return Observable.timer(x, rxTestScheduler);
    };
  }

  it('should delay all element by selector observable', function () {
    var e1 =   hot('--a--b--c--d---------|');
    var e1subs =   '^                    !';
    var expected = '----a--b--c--d-------|';

    expectObservable(e1.debounce(getTimerSelector(20))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should debounce by selector observable', function () {
    var e1 =   hot('--a--bc--d----|');
    var e1subs =   '^             !';
    var expected = '----a---c--d--|';

    expectObservable(e1.debounce(getTimerSelector(20))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should complete when source does not emit', function () {
    var e1 =   hot('-----|');
    var e1subs =   '^    !';
    var expected = '-----|';

    expectObservable(e1.debounce(getTimerSelector(20))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should complete when source is empty', function () {
    var e1 =  cold('|');
    var e1subs =   '(^!)';
    var expected = '|';

    expectObservable(e1.debounce(getTimerSelector(20))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should raise error when source does not emit and raises error', function () {
    var e1 =   hot('-----#');
    var e1subs =   '^    !';
    var expected = '-----#';

    expectObservable(e1.debounce(getTimerSelector(20))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should raise error when source throws', function () {
    var e1 =  cold('#');
    var e1subs =   '(^!)';
    var expected = '#';

    expectObservable(e1.debounce(getTimerSelector(20))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should debounce and does not complete when source does not completes', function () {
    var e1 =   hot('--a--bc--d---');
    var e1subs =   '^            ';
    var expected = '----a---c--d-';

    expectObservable(e1.debounce(getTimerSelector(20))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not completes when source does not completes', function () {
    var e1 =   hot('-');
    var e1subs =   '^';
    var expected = '-';

    expectObservable(e1.debounce(getTimerSelector(20))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not completes when source never completes', function () {
    var e1 =  cold('-');
    var e1subs =   '^';
    var expected = '-';

    expectObservable(e1.debounce(getTimerSelector(20))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should delay all element until source raises error', function () {
    var e1 =   hot('--a--b--c--d---------#');
    var e1subs =   '^                    !';
    var expected = '----a--b--c--d-------#';

    expectObservable(e1.debounce(getTimerSelector(20))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should debounce all elements while source emits by selector observable', function () {
    var e1 =   hot('---a---b---c---d---e|');
    var e1subs =   '^                   !';
    var expected = '--------------------(e|)';

    expectObservable(e1.debounce(getTimerSelector(40))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should debounce all element while source emits by selector observable until raises error', function () {
    var e1 =   hot('--a--b--c--d-#');
    var e1subs =   '^            !';
    var expected = '-------------#';

    expectObservable(e1.debounce(getTimerSelector(50))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should delay element by same selector observable emits multiple', function () {
    var e1 =    hot('----a--b--c----d----e-------|');
    var e1subs =    '^                           !';
    var expected =  '------a--b--c----d----e-----|';
    var selector = cold('--x-y-');
    var selectorSubs =
                   ['    ^ !                      ',
                    '       ^ !                   ',
                    '          ^ !                ',
                    '               ^ !           ',
                    '                    ^ !      '];

    expectObservable(e1.debounce(function () { return selector; })).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(selector.subscriptions).toBe(selectorSubs);
  });

  it('should debounce by selector observable emits multiple', function () {
    var e1 =     hot('----a--b--c----d----e-------|');
    var e1subs =     '^                           !';
    var expected =   '------a-----c---------e-----|';
    var selector = [cold('--x-y-'),
                    cold(   '----x-y-'),
                    cold(      '--x-y-'),
                    cold(           '------x-y-'),
                    cold(                '--x-y-')];
    var selectorSubs =
                    ['    ^ !                      ',
                     '       ^  !                  ',
                     '          ^ !                ',
                     '               ^    !        ',
                     '                    ^ !      '];

    expectObservable(e1.debounce(function () { return selector.shift(); })).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    for (var i = 0; i < selectorSubs.length; i++) {
      expectSubscriptions(selector[i].subscriptions).toBe(selectorSubs[i]);
    }
  });

  it('should debounce by selector observable until source completes', function () {
    var e1 =     hot('----a--b--c----d----e|');
    var e1subs =     '^                    !';
    var expected =   '------a-----c--------(e|)';
    var selector = [cold('--x-y-'),
                    cold(   '----x-y-'),
                    cold(      '--x-y-'),
                    cold(           '------x-y-'),
                    cold(                '--x-y-')];
    var selectorSubs =
                    ['    ^ !               ',
                     '       ^  !           ',
                     '          ^ !         ',
                     '               ^    ! ',
                     '                    ^!'];

    expectObservable(e1.debounce(function () { return selector.shift(); })).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    for (var i = 0; i < selectorSubs.length; i++) {
      expectSubscriptions(selector[i].subscriptions).toBe(selectorSubs[i]);
    }
  });

  it('should raise error when selector observable raises error', function () {
    var e1 =   hot('--------a--------b--------c---------|');
    var e1subs =   '^                            !';
    var expected = '---------a---------b---------#';
    var selector = [cold(  '-x-y-'),
                    cold(           '--x-y-'),
                    cold(                    '---#')];
    var selectorSubs =
                  ['        ^!                    ',
                   '                 ^ !          ',
                   '                          ^  !'];

    expectObservable(e1.debounce(function () { return selector.shift(); })).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    for (var i = 0; i < selectorSubs.length; i++) {
      expectSubscriptions(selector[i].subscriptions).toBe(selectorSubs[i]);
    }
  });

  it('should raise error when source raises error with selector observable', function () {
    var e1 =   hot('--------a--------b--------c---------d#');
    var e1subs =   '^                                    !';
    var expected = '---------a---------b---------c-------#';
    var selector = [cold(  '-x-y-'),
                    cold(           '--x-y-'),
                    cold(                    '---x-y-'),
                    cold(                              '----x-y-')];
    var selectorSubs =
                  ['        ^!                            ',
                   '                 ^ !                  ',
                   '                          ^  !        ',
                   '                                    ^!'];

    expectObservable(e1.debounce(function () { return selector.shift(); })).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    for (var i = 0; i < selectorSubs.length; i++) {
      expectSubscriptions(selector[i].subscriptions).toBe(selectorSubs[i]);
    }
  });

  it('should raise error when selector function throws', function () {
    var e1 =   hot('--------a--------b--------c---------|');
    var e1subs =   '^                         !';
    var expected = '---------a---------b------#';
    var selector = [cold(  '-x-y-'),
                    cold(           '--x-y-')];
    var selectorSubs =
                  ['        ^!                            ',
                   '                 ^ !                  '];

    function selectorFunction(x) {
      if (x !== 'c') {
        return selector.shift();
      } else {
        throw 'error';
      }
    }

    expectObservable(e1.debounce(selectorFunction)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    for (var i = 0; i < selectorSubs.length; i++) {
      expectSubscriptions(selector[i].subscriptions).toBe(selectorSubs[i]);
    }
  });

  it('should mirror the source when given an empty selector Observable', function () {
    var e1 =   hot('--------a-x-yz---bxy---z--c--x--y--z|');
    var e1subs =   '^                                   !';
    var expected = '--------a-x-yz---bxy---z--c--x--y--z|';

    function selectorFunction(x) { return Observable.empty(); }

    expectObservable(e1.debounce(selectorFunction)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should ignore all values except last, when given a never selector Observable', function () {
    var e1 =   hot('--------a-x-yz---bxy---z--c--x--y--z|');
    var e1subs =   '^                                   !';
    var expected = '------------------------------------(z|)';

    function selectorFunction(x) { return Observable.never(); }

    expectObservable(e1.debounce(selectorFunction)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should delay element by selector observable completes when it does not emits', function () {
    var e1 =   hot('--------a--------b--------c---------|');
    var e1subs =   '^                                   !';
    var expected = '---------a---------b---------c------|';
    var selector = [cold(  '-|'),
                    cold(           '--|'),
                    cold(                    '---|')];
    var selectorSubs =
                  ['        ^!                           ',
                   '                 ^ !                 ',
                   '                          ^  !       '];

    expectObservable(e1.debounce(function () { return selector.shift(); })).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    for (var i = 0; i < selectorSubs.length; i++) {
      expectSubscriptions(selector[i].subscriptions).toBe(selectorSubs[i]);
    }
  });

  it('should debounce by selector observable completes when it does not emits', function () {
    var e1 =     hot('----a--b-c---------de-------------|');
    var e1subs =     '^                                 !';
    var expected =   '-----a------c------------e--------|';
    var selector = [cold('-|'),
                    cold(   '--|'),
                    cold(     '---|'),
                    cold(               '----|'),
                    cold(                '-----|')];
    var selectorSubs =
                    ['    ^!                             ',
                     '       ^ !                         ',
                     '         ^  !                      ',
                     '                   ^!              ',
                     '                    ^    !         '];

    expectObservable(e1.debounce(function () { return selector.shift(); })).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    for (var i = 0; i < selectorSubs.length; i++) {
      expectSubscriptions(selector[i].subscriptions).toBe(selectorSubs[i]);
    }
  });

  it('should delay by promise resolves', function (done) {
    var e1 = Observable.concat(Observable.of(1),
      Observable.timer(10).mapTo(2),
      Observable.timer(10).mapTo(3),
      Observable.timer(100).mapTo(4)
      );
    var expected = [1,2,3,4];

    e1.debounce(function () {
      return new Promise(function (resolve) { resolve(42); });
    }).subscribe(function (x) {
      expect(x).toEqual(expected.shift()); },
      function () { throw 'should not be called'; },
      function () {
        expect(expected.length).toBe(0);
        done();
      });
  });

  it('should raises error when promise rejects', function (done) {
    var e1 = Observable.concat(Observable.of(1),
      Observable.timer(10).mapTo(2),
      Observable.timer(10).mapTo(3),
      Observable.timer(100).mapTo(4)
      );
    var expected = [1,2];
    var error = new Error('error');

    e1.debounce(function (x) {
      if (x === 3) {
        return new Promise(function (resolve, reject) {reject(error);});
      } else {
        return new Promise(function (resolve) {resolve(42);});
      }
    }).subscribe(function (x) {
      expect(x).toEqual(expected.shift()); },
      function (err) {
        expect(err).toBe(error);
        expect(expected.length).toBe(0);
        done();
      },
      function () {
        throw 'should not be called';
      });
  });
});