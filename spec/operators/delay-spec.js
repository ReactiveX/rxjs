/* globals describe, it, expect */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.prototype.delay()', function () {
  it('should delay by 100ms', function (done) {
    var time = Date.now();
    Observable
      .value(42)
      .delay(100)
      .subscribe(function (x) {
        expect(Date.now() - time >= 100).toBe(true);
      }, null, function() {
        expect(Date.now() - time >= 100).toBe(true);
        done();
      });
  });
});