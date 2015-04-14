var RxOld = require('rx');
var RxNew = require('src');

module.exports = function (suite) {
    // add tests
    return suite
        .add('old merge (proto) with immediate scheduler', function () {
            RxOld.Observable.range(0, 250, RxOld.Scheduler.immediate)
                .merge(RxOld.Observable.range(0, 250, RxOld.Scheduler.immediate))
                .subscribe();
        })
        .add('old merge (proto) with current thread scheduler', function () {
            RxOld.Observable.range(0, 250, RxOld.Scheduler.currentThread)
                .merge(RxOld.Observable.range(0, 250, RxOld.Scheduler.currentThread))
                .subscribe();
        })
        .add('new merge (proto) with immediate scheduler', function () {
            RxNew.Observable.range(0, 250)
                .merge(RxNew.Observable.range(0, 250))
                .subscribe();
        })
        .add('new merge (proto) with current thread scheduler', function () {
            RxNew.Observable.range(0, 250, RxNew.Scheduler.immediate)
                .merge(RxNew.Observable.range(0, 250, RxNew.Scheduler.immediate))
                .subscribe();
        });
};