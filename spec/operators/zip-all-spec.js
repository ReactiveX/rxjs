/* globals describe, it, expect */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('zipAll', function () {
  it('should take all observables from the source and zip them', function (done) {
    var expected = ['a1', 'b2', 'c3'];
    var i = 0;
    Observable.fromArray([
      Observable.fromArray(['a', 'b', 'c']),
      Observable.fromArray([1, 2, 3])
    ])
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
    Observable.fromArray([
      Observable.fromArray(['a', 'b']),
      Observable.fromArray([1, 2, 3])
    ])
    .zipAll(function (a, b) {
      return a + b;
    })
    .subscribe(function (x) {
      expect(x).toBe(expected[i++]);
    }, null, done);
  });
});