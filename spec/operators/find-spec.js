/* globals describe, it, expect, hot, expectObservable */
var Rx = require('../../dist/cjs/Rx.KitchenSink');
var Observable = Rx.Observable;

describe('Observable.prototype.find()', function () {
  function truePredicate(x) {
    return true;
  }

  it('should not emit if source does not emit', function () {
    var source = hot('-');
    var expected =   '-';

    expectObservable(source.find(truePredicate)).toBe(expected);
  });

  it('should return undefined if source is empty to match predicate', function () {
    var expected = '(x|)';

    expectObservable(Observable.empty().find(truePredicate)).toBe(expected, {x: undefined});
  });

  it('should return matching element from source emits single element', function () {
    var source = hot('--a--|');
    var expected =   '--(a|)';

    var predicate = function (value) {
      return value === 'a';
    };

    expectObservable(source.find(predicate)).toBe(expected);
  });

  it('should return undefined if element does not match with predicate', function () {
    var source = hot('--a--b--c--|');
    var expected =   '-----------(x|)';

    var predicate = function (value) {
      return value === 'z';
    };

    expectObservable(source.find(predicate)).toBe(expected, { x: undefined });
  });

  it('should raise if source raise error while element does not match with predicate', function () {
    var source = hot('--a--b--#');
    var expected =   '--------#';

    var predicate = function (value) {
      return value === 'z';
    };

    expectObservable(source.find(predicate)).toBe(expected);
  });

  it('should raise error if predicate throws error', function () {
    var source = hot('--a--b--c--|');
    var expected =   '--#';

    var predicate = function (value) {
      throw 'error';
    };

    expectObservable(source.find(predicate)).toBe(expected);
  });
});