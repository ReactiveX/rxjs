"use strict";
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;
/** @test {empty} */
describe('Observable.empty', function () {
    asDiagram('empty')('should create a cold observable with only complete', function () {
        var expected = '|';
        var e1 = Observable.empty();
        expectObservable(e1).toBe(expected);
    });
});
//# sourceMappingURL=empty-spec.js.map