var Observable = require("src/Observable");
var Subscriber = require("src/Subscriber");

var ToArraySubscriber = Subscriber.template(
    function _init() {
        this.buffer = [];
    },
    function _next(x) {
        this.buffer.push(x);
    },
    null,
    function _return() {
        var result = this.destination.next(this.buffer);
        return result.done && result || this.destination.return();
    }
);

var ToArrayObservable = Observable.template(ToArraySubscriber);

module.exports = function() {
    return new ToArrayObservable(this);
};
