"use strict";
var Rx = require('../../dist/cjs/Rx.KitchenSink');
var test_helper_1 = require('../helpers/test-helper');
var Observable = Rx.Observable;
var Subscription = Rx.Subscription;
describe('Observable.using', function () {
    test_helper_1.it('should dispose of the resource when the subscription is disposed', function (done) {
        var disposed = false;
        var source = Observable.using(function () { return new Subscription(function () { return disposed = true; }); }, function (resource) { return Observable.range(0, 3); })
            .take(2);
        source.subscribe();
        if (disposed) {
            done();
        }
        else {
            done.fail('disposed should be true but was false');
        }
    });
});
//# sourceMappingURL=using-spec.js.map