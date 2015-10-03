/* globals describe, it, expect, expectObservable, hot */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.prototype.filter()', function () {
  function oddFilter(x) {
    return (+x) % 2 === 1;
  }

  it('should filter out even values', function () {
    var source = hot('--0--1--2--3--4--|');
    var expected =   '-----1-----3-----|';

    expectObservable(source.filter(oddFilter)).toBe(expected);
  });

  it('should propagate errors from the source', function () {
    var source = hot('--0--1--2--3--4--#');
    var expected =   '-----1-----3-----#';

    expectObservable(source.filter(oddFilter)).toBe(expected);
  });

  it('should support Observable.empty', function () {
    var source = Observable.empty();
    var expected = '|';

    expectObservable(source.filter(oddFilter)).toBe(expected);
  });

  it('should support Observable.never', function () {
    var source = Observable.never();
    var expected = '-';

    expectObservable(source.filter(oddFilter)).toBe(expected);
  });

  it('should support Observable.throw', function () {
    var source = Observable.throw(new Error('oops'));
    var expected = '#';

    expectObservable(source.filter(oddFilter)).toBe(expected, undefined, new Error('oops'));
  });

  it('should send errors down the error path', function (done) {
    Observable.of(42).filter(function (x) {
      throw 'bad';
    })
      .subscribe(function (x) {
        expect(true).toBe(false);
      }, function (err) {
        expect(err).toBe('bad');
        done();
      }, function () {
        expect(true).toBe(false);
      });
  });
});
