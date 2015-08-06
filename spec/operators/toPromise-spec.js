/* globals describe, it, expect */
var Rx = require('../../dist/cjs/Rx');
var promise = require('promise');
var Observable = Rx.Observable;

describe('Observable.prototype.toPromise()', function () {
  it('should convert an Observable to a promise of its last value', function (done) {
    Observable.of(1, 2, 3).toPromise(promise).then(function (x) {
      expect(x).toBe(3);
      done();
    });
  });
  
  it('should handle errors properly', function (done) {
    Observable.throw('bad').toPromise(promise).then(function () {
      throw 'should not be called';
    }, function (err) {
      expect(err).toBe('bad');
      done();
    });
  });
});