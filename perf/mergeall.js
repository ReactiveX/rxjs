var RxOld = require('rx');
var RxNew = require('src');

module.exports = function (suite) {
    // add tests
    return suite
        .add('old mergeAll with immediate scheduler', function () {
            RxOld.Observable.range(0, 25, RxOld.Scheduler.immediate)
                .flatMap(RxOld.Observable.range(0, 25, RxOld.Scheduler.immediate))
                .subscribe();
        })
        .add('old mergeAll with current thread scheduler', function () {
            RxOld.Observable.range(0, 25, RxOld.Scheduler.currentThread)
                .flatMap(RxOld.Observable.range(0, 25, RxOld.Scheduler.immediate))
                .subscribe();
        })
        .add('new mergeAll with immediate scheduler', function () {
            RxNew.Observable.range(0, 25)
                .flatMap(RxNew.Observable.range(0, 25))
                .subscribe();
        })
        .add('new mergeAll with current thread scheduler', function () {
            RxNew.Observable.range(0, 25, RxNew.Scheduler.immediate)
                .flatMap(RxNew.Observable.range(0, 25, RxNew.Scheduler.immediate))
                .subscribe();
        });
}