var Observable = require("src/Observable");
var Subscriber = require("src/Subscriber");

var ReduceSubscriber = Subscriber.template(
    function init(project, acc) {
        this.hasSeed = acc !== void 0;
        this.project = project;
        this.hasValue = false;
    },
    function _next(x) {
        this.acc = x;
        this.hasValue || (this.hasValue = true);
        return this._result;
    },
    null,
    function _return() {
        if(!this.hasValue && this.hasSeed) {
            this.destination.next(this.acc);
        }
        return this.destination.return();
    }
);

var ReduceObservable = Observable.template(ReduceSubscriber);

module.exports = function(project, acc) {
    return new ReduceObservable(this, project, acc);
};
