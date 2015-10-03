/* globals describe, it, expect, expectObservable, hot */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.prototype.skipUntil()', function () {
  it('should skip values until another observable notifies', function () {
    var source = hot('--a--b--c--d--e--|');
    var skip =   hot('-------------x--|');
    var expected =  ('--------------e--|');

    expectObservable(source.skipUntil(skip)).toBe(expected);
  });
});