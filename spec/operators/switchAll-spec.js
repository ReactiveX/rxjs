/* expect, it, describe */
var Rx = require('../../dist/cjs/Rx');

var Observable = Rx.Observable;
var immediateScheduler = Rx.Scheduler.immediate;

describe('Observable.prototype.switchAll()', function(){
  it("should switch to each immediately-scheduled inner Observable", function (done) {
    var a = Observable.of(1, 2, 3, immediateScheduler);
    var b = Observable.of(4, 5, 6, immediateScheduler);
    var r = [1, 4, 5, 6];
    var i = 0;
    Observable.of(a, b, immediateScheduler)
      .switchAll()
      .subscribe(function (x) {
        expect(x).toBe(r[i++]);
      }, null, done);
  });
  
  it("should switch to each inner Observable", function (done) {
    var a = Observable.of(1, 2, 3);
    var b = Observable.of(4, 5, 6);
    var r = [1, 2, 3, 4, 5, 6];
    var i = 0;
    Observable.of(a, b).switchAll().subscribe(function (x) {
      expect(x).toBe(r[i++]);
    }, null, done);
  });
});