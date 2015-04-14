var Observable = require("src/Observable");

var NodeObservable = function() {
    
    function NodeObservable(func, context, selector, args) {
        this.func = func;
        this.context = context;
        this.selector = selector;
        this.args = args;
    }
    
    NodeObservable.prototype = Object.create(Observable.prototype);
    
    NodeObservable.prototype._subscribe = function(subscriber) {
        
        var args = this.args.concat(handler);
        var context = this.context;
        var selector = this.selector;
        
        this.func.apply(context, args);
        
        function handler(err) {
            
            if(err) {
                return subscriber.throw(err);
            }
            
            var len = arguments.length,
                result = { done: false, value: undefined },
                results = [];
            for (var i = 1; i < len; i++) {
                results[i - 1] = arguments[i];
            }
            
            if (selector) {
                try {
                    results = selector.apply(context, results);
                } catch (e) {
                    return subscriber.throw(e);
                }
                subscriber.next(results);
            } else {
                if (results.length <= 1) {
                    result = subscriber.next.apply(subscriber, results);
                } else {
                    result = subscriber.next(results);
                }
            }
            
            if(result.done) {
                return result;
            }
            
            return subscriber.return();
        }
    };
    
    return NodeObservable;
}();

module.exports = function(func, context, selector) {
    return function() {
        var len = arguments.length,
            args = new Array(len);
        for (var i = 0; i < len; i++) {
            args[i] = arguments[i];
        }
        
        return new NodeObservable(func, context, selector, args);
    }
}
