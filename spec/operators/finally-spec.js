/* globals describe, it, expect */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.prototype.finally()', function () {
  it('should call finally after complete', function (done) {
    var completed = false;
    Observable.of(1, 2, 3)
      .finally(function () {
        expect(completed).toBe(true);
        done();
      })
      .subscribe(null, null, function () {
        completed = true;
      });
  });

  it('should call finally after error', function (done) {
    var thrown = false;
    Observable.of(1, 2, 3)
      .map(function (x) {
        if (x === 3) {
          throw x;
        }
        return x;
      })
      .finally(function () {
        expect(thrown).toBe(true);
        done();
      })
      .subscribe(null, function () {
        thrown = true;
      });
  });

  it('should call finally upon disposal', function (done) {
    var disposed = false;
    var subscription = Observable
      .timer(100)
      .finally(function () {
        expect(disposed).toBe(true);
        done();
      }).subscribe();
    disposed = true;
    subscription.unsubscribe();
  });

  it('should call finally after complete, with a thisArg', function (done) {
    var completed = false;
    Observable.of(1, 2, 3)
      .finally(function () {
        expect(typeof this).toBe('object');
        expect(this.blesh).toBe('blish');
        expect(completed).toBe(true);
        done();
      }, {blesh: 'blish'})
      .subscribe(null, null, function () {
        completed = true;
      });
  });
});