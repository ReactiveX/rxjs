/* globals describe, it, expect */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.forkJoin', function () {
  it('should join the last values of the provided observables into an array', function(done) {
    Observable.forkJoin(Observable.of(1, 2, 3, 'a'),
      Observable.of('b'),
      Observable.of(1, 2, 3, 4, 'c'))
      .subscribe(function (x) {
        expect(x).toEqual(['a', 'b', 'c']);
      }, null, done);
  });
});