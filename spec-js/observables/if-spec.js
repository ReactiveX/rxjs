"use strict";
var Rx = require('../../dist/cjs/Rx.KitchenSink');
var marble_testing_1 = require('../helpers/marble-testing');
var test_helper_1 = require('../helpers/test-helper');
var Observable = Rx.Observable;
describe('Observable.if', function () {
    test_helper_1.it('should subscribe to thenSource when the conditional returns true', function () {
        var e1 = Observable.if(function () { return true; }, Observable.of('a'));
        var expected = '(a|)';
        marble_testing_1.expectObservable(e1).toBe(expected);
    });
    test_helper_1.it('should subscribe to elseSource when the conditional returns false', function () {
        var e1 = Observable.if(function () { return false; }, Observable.of('a'), Observable.of('b'));
        var expected = '(b|)';
        marble_testing_1.expectObservable(e1).toBe(expected);
    });
    test_helper_1.it('should complete without an elseSource when the conditional returns false', function () {
        var e1 = Observable.if(function () { return false; }, Observable.of('a'));
        var expected = '|';
        marble_testing_1.expectObservable(e1).toBe(expected);
    });
});
//# sourceMappingURL=if-spec.js.map