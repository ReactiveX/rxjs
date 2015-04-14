var Disposable = require("src/Disposable");
var Subscriber = require("src/Subscriber");

module.exports = function() {
    
    function Observable(source) {
        this.source = source;
    }
    
    Observable.create = function(subscribe) {
        return new Observable({ subscribe: subscribe });
    };
    
    Observable.template = function(SubscriberType) {
        function ObservableTemplate(source) {
            var argsIdx = 0;
            var argsLen = arguments.length;
            if(argsLen > 1) {
                var args = this.args = [];
                while(++argsIdx < argsLen) {
                    args[argsIdx - 1] = arguments[argsIdx];
                }
            }
            this.source = source;
        }
        ObservableTemplate.prototype = Object.create(Observable.prototype);
        ObservableTemplate.prototype.SubscriberType = SubscriberType;
        return ObservableTemplate;
    }
    
    Observable.prototype.args = new Array(0);
    Observable.prototype.subscribe = function(n, e, c) {
        
        if(n instanceof Subscriber) {
            return fixDisposable(this._subscribe(n));
        }
        
        if(n == null || typeof n != "object") {
            return fixDisposable(this._subscribe(new Subscriber(n, e, c)));
        }
        
        return fixDisposable(this._subscribe(new Subscriber(
            n.next   || n.onNext,
            n.throw  || n.onError,
            n.return || n.onCompleted
        )));
    };
    
    Observable.prototype._subscribe = function(subscriber) {
        return this.source.subscribe(new (this.SubscriberType || Subscriber)(subscriber, this.args));
    };
    
    Observable.prototype.forEach = Observable.prototype.subscribe;
    Observable.prototype.observe = Observable.prototype.subscribe;
    Observable.prototype.observer = Observable.prototype.subscribe;
    
    function fixDisposable(upstream) {
        switch(typeof upstream) {
            case 'function':
                return new Subscriber(null, null, null, upstream);
            case 'object':
                return upstream || Subscriber.empty;
            default:
                return Subscriber.empty;
        }
    }
    
    return Observable;
}();
