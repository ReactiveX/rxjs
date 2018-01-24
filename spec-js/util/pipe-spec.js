"use strict";
var chai_1 = require('chai');
var pipe_1 = require('../../dist/package/util/pipe');
describe('pipe', function () {
    it('should exist', function () {
        chai_1.expect(pipe_1.pipe).to.be.a('function');
    });
    it('should pipe two functions together', function () {
        var a = function (x) { return x + x; };
        var b = function (x) { return x - 1; };
        var c = pipe_1.pipe(a, b);
        chai_1.expect(c).to.be.a('function');
        chai_1.expect(c(1)).to.equal(1);
        chai_1.expect(c(10)).to.equal(19);
    });
    it('should return the same function if only one is passed', function () {
        var a = function (x) { return x; };
        var c = pipe_1.pipe(a);
        chai_1.expect(c).to.equal(a);
    });
    it('should return a noop if not passed a function', function () {
        var c = pipe_1.pipe();
        chai_1.expect(c('whatever')).to.equal('whatever');
        var someObj = {};
        chai_1.expect(c(someObj)).to.equal(someObj);
    });
});
//# sourceMappingURL=pipe-spec.js.map