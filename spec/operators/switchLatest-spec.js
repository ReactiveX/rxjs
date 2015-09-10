/* globals describe, it, expect */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;
var immediateScheduler = Rx.Scheduler.immediate;

describe('Observable.prototype.switchLatest()', function () {
  it("should switch with a selector function", function (done) {
    var a = Observable.of(1, 2, 3);
    var r = [11, 12, 13, 12, 13, 14, 13, 14, 15];
    var i = 0;
    a.switchLatest(function(x) {
      return Observable.range(x + 10, 3);
    }).subscribe(function (x) {
      expect(x).toBe(r[i++]);
    }, null, done);
  });
});