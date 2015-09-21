/* globals describe, it, expect, expectObservable, hot */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('count', function () {
  it('should count the values of an observable', function () {
    var source = hot('--a--b--c--|');
    var expected =   '-----------(x|)';
    
    expectObservable(source.count()).toBe(expected, {x: 3});
  });
});