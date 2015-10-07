/* globals describe, it, expect, expectObservable, hot */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.prototype.defaultIfEmpty()', function () {
  it('should return the argument if Observable is empty', function () {
    var e1 = Observable.empty();
    var expected = '(x|)';

    expectObservable(e1.defaultIfEmpty('x')).toBe(expected);
  });

  it('should return null if the Observable is empty and no arguments', function () {
    var e1 = Observable.empty();
    var expected = '(x|)';

    expectObservable(e1.defaultIfEmpty()).toBe(expected, { x: null });
  });

  it('should return the Observable if not empty with a default value', function () {
    var e1 =   hot('--a--b--|');
    var expected = '--a--b--|';

    expectObservable(e1.defaultIfEmpty('x')).toBe(expected);
  });

  it('should return the Observable if not empty with no default value', function () {
    var e1 =   hot('--a--b--|');
    var expected = '--a--b--|';

    expectObservable(e1.defaultIfEmpty()).toBe(expected);
  });

  it('should error if the Observable errors', function () {
    var error = 'error';
    var e1 = Observable.throw(error);
    var expected = '#';

    expectObservable(e1.defaultIfEmpty('x')).toBe(expected, null, error);
  });
});