/* globals describe, it, expect, jasmine */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.prototype.skipUntil()', function () {
  it('should skip values until another observable notifies', function (done) {
    var expected = [5];
    
    Observable.timer(0, 10)
      .skipUntil(Observable.timer(45))
      .take(1)
      .subscribe(function (x) {
        expect(x).toBe(expected.shift());
      }, null, done);
  });
});