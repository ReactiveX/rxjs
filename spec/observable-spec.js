/* globals describe, it, expect */
var Rx = require('../dist/cjs/Rx');

var Observable = Rx.Observable;

describe('Observable', function () {
  it('should be constructed with a subscriber function', function (done) {
    var source = new Observable(function (observer) {
      observer.next(1);
      observer.complete();
    });

    source.subscribe(function (x) { expect(x).toBe(1); }, null, done);
  });
});