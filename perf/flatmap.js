var RxOld = require('rx');
var RxNew = require('src');

module.exports = function (suite) {
    // add tests
    return suite
        .add('old flatMap with immediate scheduler', function () {
            RxOld.Observable.range(0, 10, RxOld.Scheduler.immediate)
                .flatMap(function (x) {
                    return RxOld.Observable.range(x, 10, RxOld.Scheduler.immediate);
                }).subscribe();
        })
        .add('old flatMap with current thread scheduler', function () {
            RxOld.Observable.range(0, 10, RxOld.Scheduler.currentThread)
                .flatMap(function (x) {
                    return RxOld.Observable.range(x, 10, RxOld.Scheduler.currentThread);
                }).subscribe();
        })
        .add('new flatMap with immediate scheduler', function () {
            RxNew.Observable.range(0, 10)
                .flatMap(function (x) {
                    return RxNew.Observable.range(x, 10);
                }).subscribe(noop, noop, noop);
        })
        .add('new flatMap with current thread scheduler', function () {
            RxNew.Observable.range(0, 10, RxNew.Scheduler.immediate)
                .flatMap(function (x) {
                    return RxNew.Observable.range(x, 10, RxNew.Scheduler.immediate);
                }).subscribe(noop, noop, noop);
        });
}