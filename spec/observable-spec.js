/* globals describe, it, expect */
var RxNext = require('../dist/cjs/RxNext');

var Observable = RxNext.Observable;

describe('Observable', function () { 
  it('should be constructed with a subscriber function', function (done) {
    var source = new Observable(function (observer) {
      observer.next(1);
      observer.return();
      return function () {
        done();
      };
    });
    
    source.subscribe(function (x) { expect(x).toBe(1); });
  });
});