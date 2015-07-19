/* globals describe, it, expect */
var RxNext = require('../../dist/cjs/RxNext');
var Observable = RxNext.Observable;

describe('Observable.zip', function(){
  it('should zip the provided observables', function(done) {
    var expected = ['a1', 'b2', 'c3'];
    
    Observable.zip([
      Observable.fromArray(['a','b','c']),
      Observable.fromArray([1,2,3])
    ], function(a, b) {
      return a + b;
    })
    .subscribe(function(x) {
      expect(x).toBe(expected[i++])
    }, null,
    function(){
      done();
    })
  });
});