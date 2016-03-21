"use strict";
var Rx = require('../../dist/cjs/Rx');
/** @test {let} */
describe('Observable.prototype.let', function () {
    it('should be able to compose with let', function (done) {
        var expected = ['aa', 'bb'];
        var i = 0;
        var foo = function (observable) { return observable.map(function (x) { return x + x; }); };
        Rx.Observable
            .fromArray(['a', 'b'])
            .let(foo)
            .subscribe(function (x) {
            expect(x).toBe(expected[i++]);
        }, done.fail, done);
    });
});
//# sourceMappingURL=let-spec.js.map