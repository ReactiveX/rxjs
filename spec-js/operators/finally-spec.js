"use strict";
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;
/** @test {finally} */
describe('Observable.prototype.finally', function () {
    it('should call finally after complete', function (done) {
        var completed = false;
        Observable.of(1, 2, 3)
            .finally(function () {
            expect(completed).toBe(true);
            done();
        })
            .subscribe(null, null, function () {
            completed = true;
        });
    });
    it('should call finally after error', function (done) {
        var thrown = false;
        Observable.of(1, 2, 3)
            .map(function (x) {
            if (x === 3) {
                throw x;
            }
            return x;
        })
            .finally(function () {
            expect(thrown).toBe(true);
            done();
        })
            .subscribe(null, function () {
            thrown = true;
        });
    });
    it('should call finally upon disposal', function (done) {
        var disposed = false;
        var subscription = Observable
            .timer(100)
            .finally(function () {
            expect(disposed).toBe(true);
            done();
        }).subscribe();
        disposed = true;
        subscription.unsubscribe();
    });
    it('should call finally when synchronously subscribing to and unsubscribing ' +
        'from a shared Observable', function (done) {
        Observable.interval(50)
            .finally(done)
            .share()
            .subscribe()
            .unsubscribe();
    });
    it('should call two finally instances in succession on a shared Observable', function (done) {
        var invoked = 0;
        function checkFinally() {
            invoked += 1;
            if (invoked === 2) {
                done();
            }
        }
        Observable.of(1, 2, 3)
            .finally(checkFinally)
            .finally(checkFinally)
            .share()
            .subscribe();
    });
});
//# sourceMappingURL=finally-spec.js.map