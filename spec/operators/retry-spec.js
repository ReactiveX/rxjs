/* globals describe, it, expect */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.prototype.retry()', function () {
  it('should retry a number of times, without error, then complete', function (done) {
    var errors = 0;
    var retries = 2;
    Observable.create(function(observer) {
      observer.next(42);
      observer.complete();
    })
      .map(function(x){
        if ((errors+=1) < retries){
          throw 'bad';
        }
        errors = 0;
        return x;
      })
      .retry(retries)
      .subscribe(
        function(x){
          expect(x).toBe(42);
        }, 
        function(err){
          expect('this was called').toBe(false);
        }, done);
  });
  it('should retry a number of times, then call error handler', function (done) {
    var errors = 0;
    var retries = 2;
    Observable.create(function(observer) {
      observer.next(42);
      observer.complete();
    })
      .map(function(x){
        if ((errors+=1) < retries){
          throw 'bad';
        }
        return x;
      })
      .retry(retries-1)
      .subscribe(
        function(x){
          expect(x).toBe(42);
        }, 
        function(err){
          expect(errors).toBe(1); 
          done();     
        }, function(){
          expect('this was called').toBe(false);
        });
  });
  it('should retry until successful completion', function (done) {
    var errors = 0;
    var retries = 10;
    Observable.create(function(observer) {
      observer.next(42);
      observer.complete();
    })
      .map(function(x){
        if ((errors+=1) < retries){
          throw 'bad';
        }
        errors = 0;
        return x;
      })
      .retry()
      .take(retries)
      .subscribe(
        function(x){
          expect(x).toBe(42);
        }, 
        function(err){
          expect('this was called').toBe(false);
        }, done);
  });
});