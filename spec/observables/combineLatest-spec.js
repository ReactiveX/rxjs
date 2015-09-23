/* globals describe, it, expect, hot, cold, expectObservable */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;
var immediateScheduler = Rx.Scheduler.immediate;

describe('Observable.combineLatest', function () {
  it('should combineLatest the provided observables', function () {
    var firstSource =  hot('----a----b----c----|');
    var secondSource = hot('--d--e--f--g--|');
    var expected =         '----uv--wx-y--z----|';
    
    var combined = Observable.combineLatest(firstSource, secondSource, function (a, b) {
        return '' + a + b;
      })
      
    expectObservable(combined).toBe(expected, {u: 'ad', v: 'ae', w: 'af', x: 'bf', y: 'bg', z: 'cg'});
  });
  
  it("should combine an immediately-scheduled source with an immediately-scheduled second", function (done) {
    var a = Observable.of(1, 2, 3, immediateScheduler);
    var b = Observable.of(4, 5, 6, 7, 8, immediateScheduler);
    var r = [[1, 4], [2, 4], [2, 5], [3, 5], [3, 6], [3, 7], [3, 8]];
    var i = 0;
    Observable.combineLatest(a, b, immediateScheduler).subscribe(function (vals) {
      expect(vals).toDeepEqual(r[i++]);
    }, null, function() {
      expect(i).toEqual(r.length);
      done();
    });
  });
});