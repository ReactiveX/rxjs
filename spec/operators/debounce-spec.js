/* globals describe, it, expect */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.prototype.debounce()', function () {
  it('should delay calls by the specified amount', function (done) {
    var expected = [3, 4];
    var source = Observable.concat(Observable.of(1),
      Observable.timer(10).mapTo(2),
      Observable.timer(10).mapTo(3),
      Observable.timer(100).mapTo(4)
      )
      .debounce(50)
      .subscribe(function (x) {
        expect(x).toBe(expected.shift());
      }, null, done);
  });
});