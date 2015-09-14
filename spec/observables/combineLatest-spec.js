/* globals describe, it, expect, expectObservable, hot */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

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
});