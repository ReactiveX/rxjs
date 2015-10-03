/* globals describe, it, expect, expectObservable, hot */
var Rx = require('../../dist/cjs/Rx');

describe('Observable.prototype.every()', function () {
  function truePredicate(x) {
    return true;
  }

  function predicate(x) {
    return x % 5 === 0;
  }

  it('should emit true if source is empty', function () {
    var source = hot('-----|');
    var expected =   '-----(x|)';

    expectObservable(source.every(predicate)).toBe(expected, {x: true});
  });

  it('should emit false if single source of element does not match with predicate', function () {
    var source = hot('--a--|');
    var expected =   '--(x|)';

    expectObservable(source.every(predicate)).toBe(expected, {x: false});
  });

  it('should emit false if none of element does not match with predicate', function () {
    var source = hot('--a--b--c--d--e--|');
    var expected =   '--(x|)';

    expectObservable(source.every(predicate)).toBe(expected, {x: false});
  });

  it('should return false if only some of element matches with predicate', function () {
    var source = hot('--a--b--c--d--e--|', {a: 5, b: 10, c: 15});
    var expected =   '-----------(x|)';

    expectObservable(source.every(predicate)).toBe(expected, {x: false});
  });

  it('should emit true if single source element match with predicate', function () {
    var source = hot('--a--|', {a: 5});
    var expected =   '-----(x|)';

    expectObservable(source.every(predicate)).toBe(expected, {x: true});
  });

  it('should emit true if all source element matches with predicate', function () {
    var source = hot('--a--b--c--d--e--|', {a: 5, b: 10, c: 15, d: 20, e: 25});
    var expected =   '-----------------(x|)';

    expectObservable(source.every(predicate)).toBe(expected, {x: true});
  });

  it('should raise error if source raises error', function () {
    var source = hot('--#');
    var expected =   '--#';

    expectObservable(source.every(truePredicate)).toBe(expected);
  });

  it('should not completes if source never emits', function () {
    var expected = '-';

    expectObservable(Rx.Observable.never().every(truePredicate)).toBe(expected);
  });

  it('should emit true if source element matches with predicate after subscription', function () {
    var source = hot('--z--^--a--b--c--d--e--|', {a: 5, b: 10, c: 15, d: 20, e: 25});
    var expected =        '------------------(x|)';

    expectObservable(source.every(predicate)).toBe(expected, {x: true});
  });

  it('should emit false if source element does not match with predicate after subscription', function () {
    var source = hot('--z--^--b--c--z--d--|', {a: 5, b: 10, c: 15, d: 20});
    var expected =        '---------(x|)';

    expectObservable(source.every(predicate)).toBe(expected, {x: false});
  });

  it('should raise error if source raises error after subscription', function () {
    var source = hot('--z--^--#');
    var expected =        '---#';

    expectObservable(source.every(truePredicate)).toBe(expected);
  });

  it('should emit true if source does not emit after subscription', function () {
    var source = hot('--z--^-----|');
    var expected =        '------(x|)';

    expectObservable(source.every(predicate)).toBe(expected, {x: true});
  });
});