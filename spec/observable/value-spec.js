/* globals describe, it, expect */
var RxNext = require('../../dist/cjs/RxNext');
var Observable = RxNext.Observable;
var Scheduler = RxNext.Scheduler;

describe('Observable.value', function(){
  it('should emit one value', function() {
    var calls = 0;
    Observable.value(42).subscribe(function(x) {
      expect(++calls).toBe(1);
      expect(x).toBe(42);
    });
  });
});