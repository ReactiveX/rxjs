var RxOld = require('rx');
var RxNew = require('src');

module.exports = function (suite) {
    // add tests
    return suite
        .add('old range with immediate scheduler', function () {
            RxOld.Observable.range(0, 25, RxOld.Scheduler.immediate).subscribe();
        })
        .add('old range with current thread scheduler', function () {
            RxOld.Observable.range(0, 25, RxOld.Scheduler.currentThread).subscribe();
        })
        .add('new range with immediate scheduler', function () {
            RxNew.Observable.range(0, 25).subscribe();
        })
        .add('new range with current thread scheduler', function () {
            RxNew.Observable.range(0, 25, RxNew.Scheduler.immediate).subscribe();
        })
};