/* globals describe, it, expect */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

fdescribe('Observable.zip', function(){
  it('should zip the provided observables', function(done) {
    var expected = ['a1', 'b2', 'c3'];
    var i = 0;

    Observable.zip(
      Observable.fromArray(['a','b','c']),
      Observable.fromArray([1,2,3]),
      function(a, b) {
        return a + b;
      }
    )
    .subscribe(function(x) {
      expect(x).toBe(expected[i++])
    }, null, done);
  });
  
  it('should end once one observable completes and its buffer is empty', function (){
    var e1 =   hot('---a--b--c--|');
    var e2 =   hot('------d----e----f--------|');
    var e3 =   hot('--------h----i----j-------------'); // doesn't complete
    var expected = '--------x----y----(z|)'; // e1 complete and buffer empty
    var values = {
      x: ['a','d','h'],
      y: ['b','e','i'],
      z: ['c','f','j']
    };
    expectObservable(Observable.zip(e1,e2,e3)).toBe(expected, values);
  });
  
  
  it('should end once one observable nexts and zips value from completed other observable whose buffer is empty', function (){
    var e1 =   hot('---a--b--c--|');
    var e2 =   hot('------d----e----f|');
    var e3 =   hot('--------h----i----j-------------'); // doesn't complete
    var expected = '--------x----y----(z|)'; // e2 buffer empty and signaled complete
    var values = {
      x: ['a','d','h'],
      y: ['b','e','i'],
      z: ['c','f','j']
    };
    expectObservable(Observable.zip(e1,e2,e3)).toBe(expected, values);
  });
  
});