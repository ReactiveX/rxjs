/* globals describe, it, expect */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.prototype.mapTo()', function () {
  it('should map all values to the passed value', function (done) {
    var foo = { bar: 'baz' };
    Observable.of(1, 2, 3).mapTo(foo)
      .subscribe(function (x) {
        expect(x).toBe(foo);
      }, null, done);
  });
});