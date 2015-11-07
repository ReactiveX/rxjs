/* globals describe, it, expect, lowerCaseO, hot, expectObservable */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.forkJoin', function () {
  it('should join the last values of the provided observables into an array', function () {
    var e1 = Observable.forkJoin(
               hot('--a--b--c--d--|'),
               hot('(b|)'),
               hot('--1--2--3--|')
    );
    var expected = '--------------(x|)';

    expectObservable(e1).toBe(expected, {x: ['d', 'b', '3']});
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

  it('forkJoin n-ary parameters empty', function () {
    var e1 = Observable.forkJoin(
               hot('--a--b--c--d--|'),
               hot('(b|)'),
               hot('------------------|')
    );
    var expected = '------------------|';

    expectObservable(e1).toBe(expected);
  });

  it('forkJoin n-ary parameters empty before end', function () {
    var e1 = Observable.forkJoin(
               hot('--a--b--c--d--|'),
               hot('(b|)'),
               hot('---------|')
    );
    var expected = '---------|';

    expectObservable(e1).toBe(expected);
  });

  it('forkJoin empty empty', function () {
    var e1 = Observable.forkJoin(
               hot('--------------|'),
               hot('---------|')
    );
    var expected = '---------|';

    expectObservable(e1).toBe(expected);
  });

  it('forkJoin none', function () {
    var e1 = Observable.forkJoin();
    var expected = '|';

    expectObservable(e1).toBe(expected);
  });

  it('forkJoin empty return', function () {
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

  it('forkJoin return return', function () {
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

  it('forkJoin empty throw', function () {
    var e1 = Observable.forkJoin(
               hot('------#'),
               hot('---------|'));
    var expected = '------#';

    expectObservable(e1).toBe(expected);
  });

  it('forkJoin empty throw', function () {
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

  it('forkJoin return throw', function () {
    var e1 = Observable.forkJoin(
               hot('------#'),
               hot('---a-----|'));
    var expected = '------#';

    expectObservable(e1).toBe(expected);
  });

  it('forkJoin return throw', function () {
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
