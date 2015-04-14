var RxOld = require('rx');
var RxNew = require('src');

module.exports = function (suite) {
    // add tests
    return suite
        .add('old filter with immediate scheduler', function () {
            RxOld.Observable.range(0, 50, RxOld.Scheduler.immediate)
                .filter(divByTwo)
                .filter(divByTen).subscribe();
        })
        .add('old filter with current thread scheduler', function () {
            RxOld.Observable.range(0, 50, RxOld.Scheduler.currentThread)
                .filter(divByTwo)
                .filter(divByTen).subscribe();
        })
        .add('new filter with immediate scheduler', function () {
            RxNew.Observable.range(0, 50)
                .filter(divByTwo)
                .filter(divByTen)
                .subscribe();
        })
        .add('new filter with current thread scheduler', function () {
            RxNew.Observable.range(0, 50, RxNew.Scheduler.immediate)
                .filter(divByTwo)
                .filter(divByTen)
                .subscribe();
        });
};

function divByTwo(x) {
    return x / 2 === 0;
}

function divByTen(x) {
    return x / 10 === 0;
}