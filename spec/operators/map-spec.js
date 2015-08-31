/* globals describe, it, expect */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.prototype.map()', function () {
  it('should map one value', function (done) {
    Observable.of(42).map(function (x) {
      return x + '!';
    })
    .subscribe(function (x) {
      expect(x).toBe('42!');
    }, null, done);
  });

  it('should map multiple values', function (done) {
    var expected = ['1!', '2!', '3!'];
    var i = 0;
    Observable.fromArray([1, 2, 3]).map(function (x) {
      return x + '!';
    })
    .subscribe(function (x) {
      expect(x).toBe(expected[i++]);
    },
    null, done);
  });

  it('should send errors down the error path', function (done) {
    Observable.of(42).map(function (x) {
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