/* globals describe, it, expect */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.from', function () {
  it('should enumerate an Array', function (done) {
    var expected = [1, 2, 3];
    var i = 0;
    Observable.from(expected).subscribe(function (x) {
        expect(x).toBe(expected[i++])
      }, null, done);
  }, 300);
});