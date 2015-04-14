var RxOld = require('rx');
var RxNew = require('src');

module.exports = function (suite) {
    // add tests
    return suite
        .add('old toArray with immediate scheduler', function () {
            RxOld.Observable.range(0, 25, RxOld.Scheduler.immediate).toArray().subscribe();
        })
        .add('old toArray with current thread scheduler', function () {
            RxOld.Observable.range(0, 25, RxOld.Scheduler.currentThread).toArray().subscribe();
        })
        .add('new toArray with immediate scheduler', function () {
            RxNew.Observable.range(0, 25).toArray().subscribe();
        })
        .add('new toArray with current thread scheduler', function () {
            RxNew.Observable.range(0, 25, RxNew.Scheduler.immediate).toArray().subscribe();
        });
};