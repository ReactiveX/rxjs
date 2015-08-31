/* globals describe, it, expect */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.prototype.do()', function () {
  it('should do one value', function (done) {
    var act = false;
    Observable.of(42).do(function (x) {
      act = true;
    })
    .subscribe(function (x) {
      expect(x).toBe(42);
      expect(act).toBe(true);
    }, null, done);
  });
});