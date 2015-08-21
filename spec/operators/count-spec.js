/* globals describe, it, expect */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('count', function () {
  it('should count the values of an observable', function (done) {
    Observable.fromArray([1, 2, 3])
      .count()
      .subscribe(function (total) {
          expect(total).toEqual(3);
        }, null, done);
  });
});