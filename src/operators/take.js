var Observable = require("src/Observable");
var Subscriber = require("src/Subscriber");

var TakeSubscriber = Subscriber.template(
    function init(total) {
        if(total <= 0) {
            return this.dispose() && this.destination.return();
        }
        this.count = 0;
        this.total = total;
    },
    function _next(x) {
        if(++this.counter < this.total) {
            return this.destination.next(x);
        } else {
            return this.dispose() && this.destination.return();
        }
    }
);

var TakeObservable = Observable.template(TakeSubscriber);

module.exports = function(total) {
    return new TakeObservable(this, total);
};
