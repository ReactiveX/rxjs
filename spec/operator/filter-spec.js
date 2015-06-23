/* globals describe, it, expect */
var RxNext = require('../../dist/cjs/RxNext');
var Observable = RxNext.Observable;

describe('Observable.prototype.filter()', function () {
  it('should filter out values', function (done) {
    var expected = [1, 3];
    var i = 0;
    Observable.fromArray([1, 2, 3]).filter(function (x) {
      return x % 2 === 1;
    })
    .subscribe(function (x) {
      expect(x).toBe(expected[i++]);
    },
      null,
      function () {
        done();
      });
  });

  it('should send errors down the error path', function (done) {
    Observable.value(42).filter(function (x) {
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