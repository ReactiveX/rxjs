var RxOld = require('rx');
var RxNew = require('src');

module.exports = function (suite) {
    // add tests
    return suite
        .add('old map with immediate scheduler', function () {
            RxOld.Observable.range(0, 50, RxOld.Scheduler.immediate)
                .map(square)
                .map(double).subscribe();
        })
        .add('old map with current thread scheduler', function () {
            RxOld.Observable.range(0, 50)
                .map(square)
                .map(double).subscribe();
        })
        .add('new map with immediate scheduler', function () {
            RxNew.Observable.range(0, 50)
                .map(square)
                .map(double).subscribe();
        })
        .add('new map with current thread scheduler', function () {
            RxNew.Observable.range(0, 50, RxNew.Scheduler.immediate)
                .map(square)
                .map(double).subscribe();
        });
};

function square(x) {
    return x * x;
}

function double(x) {
    return x + x;
}