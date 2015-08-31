/* globals describe, it, expect */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.prototype.withLatestFrom()', function () {
  it('should merge the emitted value with the latest values of the other observables', function (done) {
    var a = Observable.of('a');
    var b = Observable.of('b', 'c');
    
    Observable.value('d').delay(100)
      .withLatestFrom(a, b, function (x, a, b) { return [x, a, b]; })
      .subscribe(function (x) {
        expect(x).toEqual(['d', 'a', 'c']);
      }, null, done);
  });
  
  it('should emit nothing if the other observables never emit', function (done) {
    var a = Observable.of('a');
    var b = Observable.never();

    Observable.value('d').delay(100)
      .withLatestFrom(a, b, function (x, a, b) { return [x, a, b]; })
      .subscribe(function (x) {
        expect('this was called').toBe(false);
      }, null, done);
  });
});