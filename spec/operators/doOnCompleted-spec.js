/* globals describe, it, expect */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.prototype.doOnCompleted()', function () {
  it('should execute callback on completion', function () {
    var completed = false;
    Observable.of('something').doOnCompleted(function () {
      completed = true;
    })
    .subscribe();

    expect(completed).toBe(true);
  });
  it('should not call onCompleted', function () {
    var completed = false;
    Observable.never().doOnCompleted(function () {
      expect().fail('should not be called');
    })
    .subscribe();
    expect(completed).toBe(false);
  });
});
