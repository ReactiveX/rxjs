/* globals describe, it, expect */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.prototype.distinctUntilKeyChanged()', function () {
  it('should distinguish between values', function (done) {
    var expected = [{val: 1}, {val: 2}, {val: 1}];
    Observable
      .of({val: 1}, {val: 1}, {val: 1}, {val: 2}, {val: 2}, {val: 1})
      .distinctUntilKeyChanged('val')
      .subscribe(function (x) {
        expect(x).toDeepEqual(expected.shift());
      }, null, done);
  });
});