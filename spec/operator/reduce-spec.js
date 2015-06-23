/* globals describe, it, expect */
var RxNext = require('../../dist/cjs/RxNext');
var Observable = RxNext.Observable;

describe('Observable.prototype.reduce()', function () {
  it('should reduce', function (done) {
    Observable.of(1, 2, 3).reduce(function (o, x) {
      o += x;
      return o;
    }, '')
    .subscribe(function (x) {
      expect(x).toBe('123');
    },
      null,
      function () {
        done();
      });
  });
});