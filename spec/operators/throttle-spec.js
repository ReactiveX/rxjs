/* globals describe, it, expect */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;
var Scheduler = Rx.Scheduler;

describe('Observable.prototype.throttle()', function () {
  it('should delay calls by the specified amount', function (done) {
    var expected = [3, 4];
    var source = Observable.concat(Observable.value(1),
      Observable.timer(10).mapTo(2),
      Observable.timer(10).mapTo(3),
      Observable.timer(100).mapTo(4)
      )
      .throttle(50)
      .subscribe(function (x) {
        expect(x).toBe(expected.shift());
      }, null, done);
  });
});