/* globals describe, it, expect */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.prototype.sample', function () {
  it('should get samples when the notifier emits', function (done) {
    var expected = [1, 3, 5];
    Observable.interval(100)
      .sample(Observable.interval(220))
      .take(3)
      .subscribe(function (x) {
        expect(x).toBe(expected.shift());
      }, null, done);
  }, 2000);
  
  it('should not complete when the notifier completes, nor should it emit', function (done) {
    Observable.interval(100)
      .sample(Observable.timer(220))
      .subscribe(function (x) {
        expect(x).toBe(1);
        setTimeout(done, 500);
      }, null, function () {
        throw 'should not be called';
      });
  });
});