"use strict";
var ErrorObservable_1 = require('../../dist/cjs/observable/ErrorObservable');
/** @test {throw} */
describe('ErrorObservable', function () {
    it('should create expose a error property', function () {
        var e = new ErrorObservable_1.ErrorObservable('error');
        expect(e.error).toBe('error');
    });
    it('should create ErrorObservable via static create function', function () {
        var e = new ErrorObservable_1.ErrorObservable('error');
        var r = ErrorObservable_1.ErrorObservable.create('error');
        expect(e).toEqual(r);
    });
    it('should accept scheduler', function () {
        var e = ErrorObservable_1.ErrorObservable.create('error', rxTestScheduler);
        expectObservable(e).toBe('#');
    });
});
//# sourceMappingURL=ErrorObservable-spec.js.map