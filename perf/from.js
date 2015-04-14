var RxOld = require('rx');
var RxNew = require('src');

module.exports = function (suite) {
    var args = [];
    for (var i = 0; i < 25; i++) {
        args.push(i);
    }
    var argStr = args.join('');

    // add tests
    return suite
        .add('old from (array) with immediate scheduler', function () {
            RxOld.Observable.from(args, null, null, RxOld.Scheduler.immediate).subscribe();
        })
        .add('old from (array) with current thread scheduler', function () {
            RxOld.Observable.from(args, null, null, RxOld.Scheduler.currentThread).subscribe();
        })
        .add('new from (array) with immediate scheduler', function () {
            RxNew.Observable.from(args, null, null).subscribe();
        })
        .add('new from (array) with current thread scheduler', function () {
            RxNew.Observable.from(args, null, null, RxNew.Scheduler.immediate).subscribe();
        })
        .add('old from (string) with immediate scheduler', function () {
            RxOld.Observable.from(argStr, null, null, RxOld.Scheduler.immediate).subscribe();
        })
        .add('old from (string) with current thread scheduler', function () {
            RxOld.Observable.from(argStr, null, null, RxOld.Scheduler.currentThread).subscribe();
        })
        .add('new from (string) with immediate scheduler', function () {
            RxNew.Observable.from(argStr, null, null).subscribe();
        })
        .add('new from (string) with current thread scheduler', function () {
            RxNew.Observable.from(argStr, null, null, RxNew.Scheduler.immediate).subscribe();
        });
}