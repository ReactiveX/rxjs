/* globals describe, it, expect */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.prototype.repeat()', function () {
  it('should resubscribe count number of times', function (done) {   
    var expected = [1, 2, 1, 2];
    Observable.of(1,2)
      .repeat(2)
      .subscribe(function(x){
        expect(x).toBe(expected.shift());
      }, null, done);
  });
  
});