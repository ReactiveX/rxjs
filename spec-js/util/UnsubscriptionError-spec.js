"use strict";
var chai_1 = require('chai');
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable, UnsubscriptionError = Rx.UnsubscriptionError;
/** @test {UnsubscriptionError} */
describe('UnsubscriptionError', function () {
    it('should create a message that is a clear indication of its internal errors', function () {
        var err1 = new Error('Swiss cheese tastes amazing but smells like socks');
        var err2 = new Error('User too big to fit in tiny European elevator');
        var source1 = Observable.create(function () { return function () { throw err1; }; });
        var source2 = Observable.timer(1000);
        var source3 = Observable.create(function () { return function () { throw err2; }; });
        var source = source1.merge(source2, source3);
        var subscription = source.subscribe();
        try {
            subscription.unsubscribe();
        }
        catch (err) {
            chai_1.expect(err instanceof UnsubscriptionError).to.equal(true);
            chai_1.expect(err.message).to.equal("2 errors occurred during unsubscription:\n1) " + err1 + "\n2) " + err2);
            chai_1.expect(err.name).to.equal('UnsubscriptionError');
        }
    });
});
//# sourceMappingURL=UnsubscriptionError-spec.js.map