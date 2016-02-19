/* globals describe, it, expect, lowerCaseO, hot, expectObservable */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;
var Promise = require('promise');

describe('Observable.forkJoin', function () {
  it('should join the last values of the provided observables into an array', function () {
    var e1 = Observable.forkJoin(
               hot('--a--b--c--d--|'),
               hot('(b|)'),
               hot('--1--2--3--|')
            );
    var expected = '--------------(x|)';

    expectObservable(e1).toBe(expected, {x: ['d', 'b', '3']});

    //Hack - just adding one new test cases in here or either jasmin-is-weird-spec.js,
    //one of test breaks under publish-spec.js
    var e2 = Observable.forkJoin(
               hot('--a--b--c--d--|', { d: null }),
               hot('(b|)'),
               hot('--1--2--3--|'),
               hot('-----r--t--u--|', { u: undefined })
            );
    var expected2 = '--------------(x|)';

    expectObservable(e2).toBe(expected2, {x: [null, 'b', '3', undefined]});
  });

  it('should join the last values of the provided observables with selector', function () {
    function selector(x, y, z) {
      return x + y + z;
    }

    var e1 = Observable.forkJoin(
                hot('--a--b--c--d--|'),
                hot('(b|)'),
                hot('--1--2--3--|'),
                selector
            );
    var expected = '--------------(x|)';

    expectObservable(e1).toBe(expected, {x: 'db3'});
  });

  it('should accept single observable', function () {
    var e1 = Observable.forkJoin(
               hot('--a--b--c--d--|')
            );
    var expected = '--------------(x|)';

    expectObservable(e1).toBe(expected, {x: ['d']});
  });

  it('should accept array of observable contains single', function () {
    var e1 = Observable.forkJoin(
               [hot('--a--b--c--d--|')]
            );
    var expected = '--------------(x|)';

    expectObservable(e1).toBe(expected, {x: ['d']});
  });

  it('should accept single observable with selector', function () {
    function selector(x) {
      return x + x;
    }

    var e1 = Observable.forkJoin(
               hot('--a--b--c--d--|'),
               selector
            );
    var expected = '--------------(x|)';

    expectObservable(e1).toBe(expected, {x: 'dd'});
  });

  it('should accept array of observable contains single with selector', function () {
    function selector(x) {
      return x + x;
    }

    var e1 = Observable.forkJoin(
               [hot('--a--b--c--d--|')],
               selector
            );
    var expected = '--------------(x|)';

    expectObservable(e1).toBe(expected, {x: 'dd'});
  });

  it('should accept lowercase-o observables', function () {
    var e1 = Observable.forkJoin(
               hot('--a--b--c--d--|'),
               hot('(b|)'),
               lowerCaseO('1', '2', '3')
            );
    var expected = '--------------(x|)';

    expectObservable(e1).toBe(expected, {x: ['d', 'b', '3']});
  });

  it('should accept promise', function (done) {
    var e1 = Observable.forkJoin(
               Observable.of(1),
               Promise.resolve(2)
            );

    e1.subscribe(function (x) {
      expect(x).toEqual([1,2]);
    },
    function (err) {
      done.fail('should not be called');
    },
    done);
  });

  it('should accept array of observables', function () {
    var e1 = Observable.forkJoin(
               [hot('--a--b--c--d--|'),
                hot('(b|)'),
                hot('--1--2--3--|')]
            );
    var expected = '--------------(x|)';

    expectObservable(e1).toBe(expected, {x: ['d', 'b', '3']});
  });

  it('should accept array of observables with selector', function () {
    function selector(x, y, z) {
      return x + y + z;
    }

    var e1 = Observable.forkJoin(
               [hot('--a--b--c--d--|'),
                hot('(b|)'),
                hot('--1--2--3--|')],
                selector
             );
    var expected = '--------------(x|)';

    expectObservable(e1).toBe(expected, {x: 'db3'});
  });

  it('should not emit if any of source observable is empty', function () {
    var e1 = Observable.forkJoin(
               hot('--a--b--c--d--|'),
               hot('(b|)'),
               hot('------------------|')
            );
    var expected = '------------------|';

    expectObservable(e1).toBe(expected);
  });

  it('should complete early if any of source is empty and completes before than others', function () {
    var e1 = Observable.forkJoin(
               hot('--a--b--c--d--|'),
               hot('(b|)'),
               hot('---------|')
    );
    var expected = '---------|';

    expectObservable(e1).toBe(expected);
  });

  it('should complete when all sources are empty', function () {
    var e1 = Observable.forkJoin(
               hot('--------------|'),
               hot('---------|')
    );
    var expected = '---------|';

    expectObservable(e1).toBe(expected);
  });

  it('should complete if source is not provided', function () {
    var e1 = Observable.forkJoin();
    var expected = '|';

    expectObservable(e1).toBe(expected);
  });

  it('should complete if sources list is empty', function () {
    var e1 = Observable.forkJoin([]);
    var expected = '|';

    expectObservable(e1).toBe(expected);
  });

  it('should complete when any of source is empty with selector', function () {
    function selector(x, y) {
      return x + y;
    }

    var e1 = Observable.forkJoin(
               hot('--a--b--c--d--|'),
               hot('---------|'),
               selector);
    var expected = '---------|';

    expectObservable(e1).toBe(expected);
  });

  it('should emit results by resultselector', function () {
    function selector(x, y) {
      return x + y;
    }

    var e1 = Observable.forkJoin(
               hot('--a--b--c--d--|'),
               hot('---2-----|'),
               selector);
    var expected = '--------------(x|)';

    expectObservable(e1).toBe(expected, {x: 'd2'});
  });

  it('should raise error when any of source raises error with empty observable', function () {
    var e1 = Observable.forkJoin(
               hot('------#'),
               hot('---------|'));
    var expected = '------#';

    expectObservable(e1).toBe(expected);
  });

  it('should raise error when any of source raises error with selector with empty observable', function () {
    function selector(x, y) {
      return x + y;
    }

    var e1 = Observable.forkJoin(
               hot('------#'),
               hot('---------|'),
               selector);
    var expected = '------#';

    expectObservable(e1).toBe(expected);
  });

  it('should raise error when source raises error', function () {
    var e1 = Observable.forkJoin(
               hot('------#'),
               hot('---a-----|'));
    var expected = '------#';

    expectObservable(e1).toBe(expected);
  });

  it('should raise error when source raises error with selector', function () {
    function selector(x, y) {
      return x + y;
    }

    var e1 = Observable.forkJoin(
               hot('------#'),
               hot('-------b-|'),
               selector);
    var expected = '------#';

    expectObservable(e1).toBe(expected);
  });
});
