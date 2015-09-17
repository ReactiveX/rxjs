/* globals describe, it, expect */
var Rx = require('../../dist/cjs/Rx');
var Promise = require('promise');
var Observable = Rx.Observable;

describe('Observable.prototype.toPromise()', function () {
  it('should convert an Observable to a promise of its last value', function (done) {
    Observable.of(1, 2, 3).toPromise(Promise).then(function (x) {
      expect(x).toBe(3);
      done();
    });
  });
  
  it('should handle errors properly', function (done) {
    Observable.throw('bad').toPromise(Promise).then(function () {
      throw 'should not be called';
    }, function (err) {
      expect(err).toBe('bad');
      done();
    });
  });
  
  it('should allow for global config via Rx.config.Promise', function(done){
    var wasCalled = false;
    __root__.Rx = {};
    __root__.Rx.config = {};
    __root__.Rx.config.Promise = function MyPromise(callback) {
      wasCalled = true;
      return new Promise(callback);
    };
    
    Observable.of(42).toPromise().then(function(x) {
      expect(wasCalled).toBe(true);
      expect(x).toBe(42);
      done();
    });
  });
});