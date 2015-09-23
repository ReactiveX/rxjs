/* globals describe, it, expect */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.prototype.zipAll', function () {
  it('should take all observables from the source and zip them', function (done) {
    var expected = ['a1', 'b2', 'c3'];
    var i = 0;
    Observable.of(
      Observable.of('a','b','c'),
      Observable.of(1,2,3)
    )
    .zipAll(function (a, b) {
      return a + b;
    })
    .subscribe(function (x) {
      expect(x).toBe(expected[i++]);
    }, null, done);
  });

  it('should zip until one child terminates', function (done) {
    var expected = ['a1', 'b2'];
    var i = 0;
    Observable.of(
      Observable.of('a','b','c'),
      Observable.of(1,2)
    )
    .zipAll(function (a, b) {
      return a + b;
    })
    .subscribe(function (x) {
      expect(x).toBe(expected[i++]);
    }, null, done);
  });
});