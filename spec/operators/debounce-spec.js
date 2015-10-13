/* globals describe, it, expect, expectObservable, hot, cold, rxTestScheduler */
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
    var expected = '----a--b--c--d-------|';

    expectObservable(e1.debounce(getTimerSelector(20))).toBe(expected);
  });

  it('should debounce by selector observable', function () {
    var e1 =   hot('--a--bc--d----|');
    var expected = '----a---c--d--|';

    expectObservable(e1.debounce(getTimerSelector(20))).toBe(expected);
  });

  it('should complete when source does not emit', function () {
    var e1 =   hot('-----|');
    var expected = '-----|';

    expectObservable(e1.debounce(getTimerSelector(20))).toBe(expected);
  });

  it('should complete when source is empty', function () {
    var e1 = Observable.empty();
    var expected = '|';

    expectObservable(e1.debounce(getTimerSelector(20))).toBe(expected);
  });

  it('should raise error when source does not emit and raises error', function () {
    var e1 =   hot('-----#');
    var expected = '-----#';

    expectObservable(e1.debounce(getTimerSelector(20))).toBe(expected);
  });

  it('should raise error when source throws', function () {
    var e1 = Observable.throw('error');
    var expected = '#';

    expectObservable(e1.debounce(getTimerSelector(20))).toBe(expected);
  });

  it('should debounce and does not complete when source does not completes', function () {
    var e1 =   hot('--a--bc--d---');
    var expected = '----a---c--d--';

    expectObservable(e1.debounce(getTimerSelector(20))).toBe(expected);
  });

  it('should not completes when source does not completes', function () {
    var e1 =   hot('-');
    var expected = '-';

    expectObservable(e1.debounce(getTimerSelector(20))).toBe(expected);
  });

  it('should not completes when source never completes', function () {
    var e1 = Observable.never();
    var expected = '-';

    expectObservable(e1.debounce(getTimerSelector(20))).toBe(expected);
  });

  it('should delay all element until source raises error', function () {
    var e1 =   hot('--a--b--c--d---------#');
    var expected = '----a--b--c--d-------#';

    expectObservable(e1.debounce(getTimerSelector(20))).toBe(expected);
  });

  it('should debounce all elements while source emits by selector observable', function () {
    var e1 =   hot('---a---b---c---d---e|');
    var expected = '--------------------(e|)';

    expectObservable(e1.debounce(getTimerSelector(40))).toBe(expected);
  });

  it('should debounce all element while source emits by selector observable until raises error', function () {
    var e1 =   hot('--a--b--c--d-#');
    var expected = '-------------#';

    expectObservable(e1.debounce(getTimerSelector(50))).toBe(expected);
  });

  it('should delay element by same selector observable emits multiple', function () {
    var e1 =    hot('----a--b--c----d----e-------|');
    var expected =  '------a--b--c----d----e-----|';
    var selector = cold('--x-y-');

    expectObservable(e1.debounce(function () { return selector; })).toBe(expected);
  });

  it('should debounce by selector observable emits multiple', function () {
    var e1 =     hot('----a--b--c----d----e-------|');
    var expected =   '------a-----c---------e-----|';
    var selector = [cold('--x-y-'),
                    cold(   '----x-y-'),
                    cold(      '--x-y-'),
                    cold(           '------x-y-'),
                    cold(                '--x-y-')];

    expectObservable(e1.debounce(function () { return selector.shift(); })).toBe(expected);
  });

  it('should debounce by selector observable until source completes', function () {
    var e1 =     hot('----a--b--c----d----e|');
    var expected =   '------a-----c--------(e|)';
    var selector = [cold('--x-y-'),
                    cold(   '----x-y-'),
                    cold(      '--x-y-'),
                    cold(           '------x-y-'),
                    cold(                '--x-y-')];

    expectObservable(e1.debounce(function () { return selector.shift(); })).toBe(expected);
  });

  it('should raise error when selector observable raises error', function () {
    var e1 =   hot('--------a--------b--------c---------|');
    var expected = '---------a---------b---------#';
    var selector = [cold(  '-x-y-'),
                    cold(           '--x-y-'),
                    cold(                    '---#')];

    expectObservable(e1.debounce(function () { return selector.shift(); })).toBe(expected);
  });

  it('should raise error when source raises error with selector observable', function () {
    var e1 =   hot('--------a--------b--------c---------d#');
    var expected = '---------a---------b---------c-------#';
    var selector = [cold(  '-x-y-'),
                    cold(           '--x-y-'),
                    cold(                    '---x-y-'),
                    cold(                              '----x-y-')];

    expectObservable(e1.debounce(function () { return selector.shift(); })).toBe(expected);
  });

  it('should raise error when selector function throws', function () {
    var e1 =   hot('--------a--------b--------c---------|');
    var expected = '---------a---------b------#';
    var selector = [cold(  '-x-y-'),
                    cold(           '--x-y-')];

    function selectorFunction(x) {
      if (x !== 'c') {
        return selector.shift();
      } else {
        throw 'error';
      }
    }

    expectObservable(e1.debounce(selectorFunction)).toBe(expected);
  });

  it('should delay element by selector observable completes when it does not emits', function () {
    var e1 =   hot('--------a--------b--------c---------|');
    var expected = '---------a---------b---------c------|';
    var selector = [cold(  '-|'),
                    cold(           '--|'),
                    cold(                    '---|')];

    expectObservable(e1.debounce(function () { return selector.shift(); })).toBe(expected);
  });

  it('should debounce by selector observable completes when it does not emits', function () {
    var e1 =     hot('----a--b-c---------de-------------|');
    var expected =   '-----a------c------------e--------|';
    var selector = [cold('-|'),
                    cold(   '--|'),
                    cold(     '---|'),
                    cold(               '----|'),
                    cold(                '-----|')];

    expectObservable(e1.debounce(function () { return selector.shift(); })).toBe(expected);
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