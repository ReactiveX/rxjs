/* globals describe, it, expect */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.prototype.defaultIfEmpty()', function () {
  it('should return the argument if Observable is empty', function (done) {
    var emptyObservable = Observable.empty();
    emptyObservable.defaultIfEmpty(2)
      .subscribe(function(x) {
        expect(x).toBe(2);
      }, null, done);
  });

  it('should return null if the Observable is empty and no arguments', function(done) {
    var emptyObservable = Observable.empty();
    emptyObservable.defaultIfEmpty()
      .subscribe(function(x) {
        expect(x).toBe(null);
      }, null, done);
  });

  it('should return the Observable if not empty with a default value', function(done) {
    var expected = [1,2,3];
    var observable = Observable.of(1,2,3);
    observable.defaultIfEmpty(2)
      .subscribe(function(x) {
        expect(x).toBe(expected.shift());
      }, null, done);
  });

  it('should return the Observable if not empty with no default value', function(done) {
    var expected = [1,2,3];
    var observable = Observable.of(1,2,3);
    observable.defaultIfEmpty()
      .subscribe(function(x) {
        expect(x).toBe(expected.shift());
      }, null, done);
  });

  it('should error if the Observable errors', function(done) {
    var observable = Observable.throw("candy");
    observable.defaultIfEmpty(2)
      .subscribe(function(x) {
        throw "this should not be called";
      }, function(err) {
        expect(err).toBe("candy");
        done();
      });
  });
});
