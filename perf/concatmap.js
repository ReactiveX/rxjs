var RxOld = require('rx');
var RxNew = require('src');

module.exports = function (suite) {
    // add tests
    return suite
        .add('old concatMap with immediate scheduler', function () {
            RxOld.Observable.range(0, 25, RxOld.Scheduler.immediate)
                .concatMap(function (x) {
                    return RxOld.Observable.range(x, 25, RxOld.Scheduler.immediate);
                }).subscribe();
        })
        .add('old concatMap with current thread scheduler', function () {
            RxOld.Observable.range(0, 25, RxOld.Scheduler.currentThread)
                .concatMap(function (x) {
                    return RxOld.Observable.range(x, 25, RxOld.Scheduler.currentThread);
                }).subscribe();
        })
        .add('new concatMap with immediate scheduler', function () {
            RxNew.Observable.range(0, 25)
                .concatMap(function (x) {
                    return RxNew.Observable.range(x, 25);
                }).subscribe();
        })
        .add('new concatMap with current thread scheduler', function () {
            RxNew.Observable.range(0, 25, RxNew.Scheduler.immediate)
                .concatMap(function (x) {
                    return RxNew.Observable.range(x, 25, RxNew.Scheduler.immediate);
                }).subscribe();
        })
};