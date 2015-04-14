var RxOld = require('rx');
var RxNew = require('src');

module.exports = function (suite) {
    var args = [];
    for (var i = 0; i < 25; i++) {
        args.push(i);
    }

    // add tests
    return suite
        .add('old fromArray with immediate scheduler', function () {
            RxOld.Observable.fromArray(args, RxOld.Scheduler.immediate).subscribe();
        })
        .add('old fromArray with current thread scheduler', function () {
            RxOld.Observable.fromArray(args, RxOld.Scheduler.currentThread).subscribe();
        })
        .add('new fromArray with immediate scheduler', function () {
            RxNew.Observable.fromArray(args).subscribe();
        })
        .add('new fromArray with current thread scheduler', function () {
            RxNew.Observable.fromArray(args, RxNew.Scheduler.immediate).subscribe();
        });
}