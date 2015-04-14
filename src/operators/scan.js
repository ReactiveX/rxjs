var Observable = require("src/Observable");
var Subscriber = require("src/Subscriber");

var ScanSubscriber = Subscriber.template(
    function init(project, acc) {
        this.hasSeed = acc !== void 0;
        this.project = project;
        this.hasValue = false;
    },
    function _next(x) {
        if(this.hasValue || (this.hasValue = this.hasSeed)) {
            return this.destination.next(this.acc = this.project(this.acc, x));
        }
        this.acc = x;
        this.hasValue = true;
        return this.destination.next(x);
    },
    null,
    function _return() {
        if(!this.hasValue && this.hasSeed) {
            this.destination.next(this.acc);
        }
        return this.destination.return();
    }
);

var ScanObservable = Observable.template(ScanSubscriber);

module.exports = function(project, acc) {
    return new ScanObservable(this, project, acc);
};
