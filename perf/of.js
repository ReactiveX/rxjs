var RxOld = require('rx');
var RxNew = require('src');

module.exports = function (suite) {
    var args = [];
    for (var i = 0; i < 25; i++) {
        args.push(i);
    }

    // add tests
    return suite
        .add('old of  with immediate scheduler', function () {
            args[25] = RxOld.Scheduler.immediate;
            RxOld.Observable.of.apply(null, args).subscribe();
        })
        .add('old of  with current thread scheduler', function () {
            args[25] = RxOld.Scheduler.currentThread;
            RxOld.Observable.of.apply(null, args).subscribe();
        })
        .add('new of  with immediate scheduler', function () {
            args[25] = undefined;
            RxNew.Observable.of.apply(null, args).subscribe();
        })
        .add('new of  with current thread scheduler', function () {
            args[25] = RxNew.Scheduler.immediate;
            RxNew.Observable.of.apply(null, args).subscribe();
        });
};