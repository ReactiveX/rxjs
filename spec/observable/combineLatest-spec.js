/* globals describe, it, expect */
var RxNext = require('../../dist/cjs/RxNext');
var Observable = RxNext.Observable;

describe('Observable.combineLatest', function(){
  it('should combineLatest the provided observables', function(done) {
    var expected = ['00', '01', '11', '12', '22', '23'];
    var i = 0;

    Observable.combineLatest([
      Observable.interval(50).take(3),
      Observable.interval(45).take(4)
    ], function(a, b) {
      return '' + a + b;
    })
    .subscribe(function(x) {
      expect(x).toBe(expected[i++])
    }, null,
    function(){
      done();
    })
  }, 300);
});