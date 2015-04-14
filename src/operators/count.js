var Observable = require("src/Observable");
var Subscriber = require("src/Subscriber");

var CountSubscriber = Subscriber.template(
    function init() {
        this.total = 0;
    },
    function _next(x) {
        this.total++;
    },
    null,
    function _return() {
        var result = this.destination.next(this.total);
        if(result.done) {
            return result;
        }
        return this.destination.return();
    }
);

var CountObservable = Observable.template(CountSubscriber);

module.exports = function() {
    return new CountObservable(this);
};
