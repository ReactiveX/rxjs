/* globals describe, it, expect, hot, cold, expectObservable */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.prototype.ignoreElements', function () {
  it('should ignore all the elements of the source', function () {
    var source = hot('--a--b--c--d--|');
    var expected =   '--------------|';

    expectObservable(source.ignoreElements()).toBe(expected);
  });

  it('should propagate errors from the source', function () {
    var source = hot('--a--#');
    var expected =   '-----#';

    expectObservable(source.ignoreElements()).toBe(expected);
  });

  it('should support Observable.empty', function () {
    var source = Observable.empty();
    var expected = '|';

    expectObservable(source.ignoreElements()).toBe(expected);
  });

  it('should support Observable.never', function () {
    var source = Observable.never();
    var expected = '-';

    expectObservable(source.ignoreElements()).toBe(expected);
  });

  it('should support Observable.throw', function () {
    var source = Observable.throw(new Error('oops'));
    var expected = '#';

    expectObservable(source.ignoreElements()).toBe(expected, undefined, new Error('oops'));
  });
});
