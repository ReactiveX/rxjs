/* globals describe, it, expect */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.prototype.timeout', function () {
  it('should timeout after a specified delay', function (done) {
    Observable.never().timeout(100)
      .subscribe(function (x) {
        throw 'should not next';
      }, function (err) {
        expect(err.message).toBe('timeout');
        done();
      }, function () {
        throw 'should not complete';
      });
  }, 2000);
  
  it('should timeout after a delay and send the passed error', function (done) {
    Observable.never().timeout(100, 'hello')
      .subscribe(function () {
        throw 'should not next';
      }, function (err) {
        expect(err).toBe('hello');
        done();
      }, function () {
        throw 'should not complete';
      })
  });
  
  
  it('should timeout at a specified Date', function (done) {
    var date = new Date(Date.now() + 100);
    
    Observable.never().timeout(date)
      .subscribe(function (x) {
        throw 'should not next';
      }, function (err) {
        expect(err.message).toBe('timeout');
        done();
      }, function () {
        throw 'should not complete';
      });
  }, 2000);
});