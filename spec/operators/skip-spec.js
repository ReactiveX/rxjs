/* globals describe, it, expect */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.prototype.skip()', function () {
  it('should skip values before a total', function (done) {
    var expected = [4, 5];
    Observable.of(1, 2, 3, 4, 5).skip(3).subscribe(function (x) {
      expect(x).toBe(expected.shift());
    }, null, done);
  });
  
  it('should skip all values without error if total is more than actual number of values', function (done) {
    Observable.of(1, 2, 3, 4, 5).skip(6).subscribe(function (x) {
      expect(true).toBe('this should never be called');
    }, null, done);
  });
});