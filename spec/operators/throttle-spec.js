/* globals describe, it, expect */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;
var Scheduler = Rx.Scheduler;

describe('Observable.prototype.throttle()', function () {
  it('should throttle events', function (done) {
    Observable.of(1, 2, 3).throttle(50)
      .subscribe(function (x) {
        expect(x).toBe(1);
      }, null, done);
  });

  it('should throttle events multiple times', function (done) {
    var expected = ['1-0', '2-0'];
    Observable.concat(
      Observable.timer(0, 10).take(3).map(function (x) { return '1-' + x; }),
      Observable.timer(80, 10).take(5).map(function (x) { return '2-' + x; })
      )
      .throttle(50)
      .subscribe(function (x) {
        expect(x).toBe(expected.shift());
      }, null, done);
  });
});