var RxOld = require('rx');
var RxNew = require('src');

module.exports = function (suite) {
    // add tests
    return suite
        .add('old scan with immediate scheduler', function () {
            RxOld.Observable.range(0, 25, RxOld.Scheduler.immediate)
                .map(addTwo)
                .filter(isEven)
                .scan(addX).subscribe();
        })
        .add('old scan with current thread scheduler', function () {
            RxOld.Observable.range(0, 25, RxOld.Scheduler.currentThread)
                .map(addTwo)
                .filter(isEven)
                .scan(addX).subscribe();
        })
        .add('new scan with immediate scheduler', function () {
            RxNew.Observable.range(0, 25)
                .map(addTwo)
                .filter(isEven)
                .scan(addX).subscribe();
        })
        .add('new scan with current thread scheduler', function () {
            RxNew.Observable.range(0, 25, RxNew.Scheduler.immediate)
                .map(addTwo)
                .filter(isEven)
                .scan(addX).subscribe();
        });
}

function addTwo(x) {
    return x + 2;
}

function addX(acc, x) {
    return x + x
}

function isEven(x) {
    return x % 2 === 0;
}