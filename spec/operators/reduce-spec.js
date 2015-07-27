/* globals describe, it, expect */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.prototype.reduce()', function () {
  it('should reduce', function (done) {
    Observable.of('1', '2', '3').reduce(function (o, x) {
      return o + x;
    }, '')
    .subscribe(function (x) {
        expect(x).toBe('123');
      },
      null, done);
  });
});