var Observable = require("src/Observable");
var Subscriber = require("src/Subscriber");

var TimeIntervalSubscriber = Subscriber.template(
    function init() {
        this.time = Date.now();
    },
    function _next(x) {
        var now = Date.now();
        var interval = now - this.time;
        this.time = now;
        return this.destination.next({
            interval: interval,
            value: x
        });
    }
);

var TimeIntervalObservable = Observable.template(TimeIntervalSubscriber);

module.exports = function() {
    return new TimeIntervalObservable(this);
};
