/* globals describe, it, expect, expectObservable, hot, cold */
var Rx = require('../../dist/cjs/Rx');

describe('Observable.prototype.last()', function(){
  it('should take the last value of an observable', function(){
    var e1 = hot('--a--^--b--c--|');
    var expected =    '---------(c|)';
    expectObservable(e1.last()).toBe(expected)
  });
  
  it('should error on empty', function() {
    var e1 = hot('--a--^----|');
    var expected =    '-----#';
    expectObservable(e1.last()).toBe(expected, null, new Rx.EmptyError());
  });
  
  it('should go on forever on never', function() {
    var e2 = hot('--^---');
    var expected = '----';
    expectObservable(e2.last()).toBe(expected);
  });
});