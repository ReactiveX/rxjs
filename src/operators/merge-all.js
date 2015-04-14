var Observable = require("src/Observable");
var Subscriber = require("src/Subscriber");

var MergeAllSubscriber = Subscriber.template(
    function init(concurrent) {
        if(typeof concurrent != 'number' || concurrent < 1) {
            this.concurrent = Number.POSITIVE_INFINITY;
        } else {
            this.concurrent = concurrent;
            this.buffer = [];
        }
    },
    function _next(x) {
        var upstream = this,
            buffer = upstream.buffer,
            concurrent = upstream.concurrent,
            destination = this.destination, inner;
        
        if(upstream.length > concurrent) {
            buffer.push(x);
        } else {
            upstream.add(inner = x.subscribe(
                function (x) { return destination.next(x);  },
                function (e) { return destination.throw(e); },
                function ( ) {
                    inner && upstream.remove(inner);
                    if(upstream.length < concurrent) {
                        if(buffer && buffer.length > 0) {
                            upstream.next(buffer.shift());
                        } else if(upstream.stopped === true && upstream.length === 0) {
                            return destination.return();
                        }
                    }
                    upstream._result.done = false;
                    return upstream._result;
                }
            ));
        }
    },
    null,
    function _return() {
        this.stopped = true;
        if(this.length === 0 && (!this.buffer || this.buffer.length === 0)) {
            return this.destination.return();
        }
        this._result.done = false;
        return this._result;
    }
);

var MergeAllObservable = Observable.template(MergeAllSubscriber);

module.exports = function(concurrent) {
    return new MergeAllObservable(this, concurrent);
};
