/* globals describe, it, expect, hot, cold, expectObservable */
var Rx = require('../../dist/cjs/Rx.KitchenSink');
var Observable = Rx.Observable;

describe('Observable.prototype.elementAt', function () {
  it('should return first element by zero-based index', function () {
    var source = hot('--a--b--c--|');
    var expected =   '--(a|)';

    expectObservable(source.elementAt(0)).toBe(expected);
  });

  it('should return non-first element by zero-based index', function () {
    var source = hot('--a--b--c--d--e--f--|');
    var expected =   '-----------(d|)';

    expectObservable(source.elementAt(3)).toBe(expected);
  });

  it('should return last element by zero-based index', function () {
    var source = hot('--a--b--c--|');
    var expected =   '--------(c|)';

    expectObservable(source.elementAt(2)).toBe(expected);
  });

  it('should throw if index is smaller than zero', function () {
    expect(function () { Observable.range(0,10).elementAt(-1); })
      .toThrow(new Rx.ArgumentOutOfRangeError());
  });

  it('should raise error if index is out of range but does not have default value', function () {
    var source = hot('--a--|');
    var expected =   '-----#';

    expectObservable(source.elementAt(3))
      .toBe(expected, null, new Rx.ArgumentOutOfRangeError());
  });

  it('should return default value if index is out of range', function () {
    var source = hot('--a--|');
    var expected =   '-----(x|)';
    var defaultValue = '42';

    expectObservable(source.elementAt(3, defaultValue)).toBe(expected, { x: defaultValue });
  });
});