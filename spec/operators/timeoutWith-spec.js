/* globals describe, it, expect */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.prototype.timeoutWith', function () {
  it('should timeout after a specified delay then subscribe to the passed observable', function (done) {
    var expected = [1, 2, 3];
    Observable.never().timeoutWith(100, Observable.of(1,2,3))
      .subscribe(function (x) {
        expect(x).toBe(expected.shift());
      }, null, done);
  }, 2000);
  
  
  it('should timeout at a specified date then subscribe to the passed observable', function (done) {
    var expected = [1, 2, 3];
    var date = new Date(Date.now() + 100);
    Observable.never().timeoutWith(date, Observable.of(1,2,3))
      .subscribe(function (x) {
        expect(x).toBe(expected.shift());
      }, null, done);
  }, 2000);
});