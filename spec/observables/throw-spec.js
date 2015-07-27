/* globals describe, it, expect */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.throw', function () {
  it('should emit one value', function (done) {
    var calls = 0;
    Observable.throw('bad').subscribe(function () {
      throw 'should not be called';
    }, function (err) {
      expect(++calls).toBe(1);
      expect(err).toBe('bad');
      done();
    });
  });
});