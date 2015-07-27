/* globals describe, it, expect */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('toArray', function () {
  it('should reduce the values of an observable into an array', function (done) {
    Observable.fromArray([1, 2, 3])
      .toArray()
      .subscribe(function (arr) {
          expect(arr).toEqual([1, 2, 3]);
        }, null, done);
  });
});