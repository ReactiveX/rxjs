/* globals describe, it, expect, expectObservable, hot, cold */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('mergeAll', function () {
  it('should merge all obsevables in an obsevable', function (done) {
    var expected = [1, 2, 3];
    var i = 0;
    Observable.fromArray([
      Observable.of(1),
      Observable.of(2),
      Observable.of(3)
    ])
    .mergeAll()
    .subscribe(function (x) {
      expect(x).toBe(expected[i++]);
    }, null, function () {
      done();
    });
  });

  it('should throw if any child observable throws', function (done) {
    Observable.fromArray([
      Observable.of(1),
      Observable.throw('bad'),
      Observable.of(3)
    ])
    .mergeAll()
    .subscribe(function (x) {
      expect(x).toBe(1);
    }, function (err) {
      expect(err).toBe('bad');
      done();
    });
  });
  
  it('should handle merging a hot observable of observables', function (){
    var x = cold(     'a---b---c---|');
    var y = cold(        'd---e---f---|');
    var e1 =    hot('--x--y--|', { x: x, y: y });
    var expected =  '--a--db--ec--f---|';
    expectObservable(e1.mergeAll()).toBe(expected);
  });
});