/* globals describe, it, expect, expectObservable, hot */
var Rx = require('../../dist/cjs/Rx');

describe('Observable.prototype.buffer', function () {
  it('should emit buffers that close and reopen', function () {
    var e1 =       hot('-a-b-c-d-e-f-g-h-i-|');
    var expected =     '-----x-----y-----z-|';
    var interval = hot('-----1-----2-----3-|');
    
    expectObservable(e1.buffer(interval)).toBe(expected, {x: ['a','b','c'], y: ['d','e','f'], z: ['g','h','i']});
  });
});