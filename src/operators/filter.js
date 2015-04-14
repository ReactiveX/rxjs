var Observable = require("src/Observable");
var Subscriber = require("src/Subscriber");

var FilterSubscriber = Subscriber.template(
    function _init(select) {
        this.select = select;
    },
    function _next(x) {
        return !this.select(x) && this.result || this.destination.next(x);
    }
);

var FilterObservable = Observable.template(FilterSubscriber);

module.exports = function(select) {
    return new FilterObservable(this, select);
};
