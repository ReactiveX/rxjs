var noop = require("src/support/noop");
var Disposable = require("src/Disposable");

module.exports = function() {
    
    function destNext   (x) { return this.destination["next"](x);  }
    function destThrow  (e) { return this.destination["throw"](e); }
    function destReturn ( ) { return this.destination["return"](); }
    
    function Subscriber(onNextOrDest, onError, onCompleted, dispose) {
        
        this.stopped = false;
        
        if(onNextOrDest && typeof onNextOrDest === 'object') {
            this.destination = onNextOrDest;
            this._result = onNextOrDest._result;
            this._next   || (this._next = destNext);
            this._throw  || (this._throw = destThrow);
            this._return || (this._return = destReturn);
        } else {
            this._result = { value: undefined, done: false };
            this._next   = onNextOrDest || noop;
            this._throw  = onError      || noop;
            this._return = onCompleted  || noop;
        }
        
        Disposable.call(this, dispose);
    }
    
    Subscriber.prototype = new Disposable(function() {
        this.stopped = true;
        delete this._result;
        delete this._next;
        delete this._throw;
        delete this._return;
        return true;
    });
    
    Subscriber.template = function(init, _next, _throw, _return) {
        function SubscriberTemplate(destination, args) {
            Subscriber.call(this, destination);
            init && init.apply(this, args);
        }
        SubscriberTemplate.prototype = Object.create(Subscriber.prototype);
        SubscriberTemplate.prototype._next = _next;
        SubscriberTemplate.prototype._throw = _throw;
        SubscriberTemplate.prototype._return = _return;
        return SubscriberTemplate;
    };
    
    Subscriber.prototype["next"] = function(x) {
        
        var next = this._next;
        var result = this._result;
        
        if(next == null) {
            result.done = true;
            result.value = undefined;
            return result;
        }
        
        var result2 = next.call(this, x) || result;
        
        if(this.disposed) {
            result2.done = true;
        } else if(result2.done) {
            this.dispose();
        }
        
        return result2;
    };
    
    Subscriber.prototype["throw"] = function(e) {
        
        var error = this._throw;
        var result = this._result;
        
        if(this.stopped) {
            result.done = true;
            return result;
        }
        
        this.stopped = true;
        
        if(!error) {
            result.done = true;
            return result;
        }
        
        var result2 = error.call(this, e) || result;
        
        if(this.disposed) {
            result2.done = true;
        } else if(result2.done) {
            result2.done = this.dispose() !== false;
        }
        
        return result2;
    }
    
    Subscriber.prototype["return"] = function() {
        
        var completed = this._return;
        var result = this._result;
        
        if(this.stopped) {
            result.done = true;
            return result;
        }
        
        this.stopped = true;
        
        if(!completed) {
            result.done = true;
            return result;
        }
        
        var result2 = completed.call(this) || result;
        
        if(this.disposed) {
            result2.done = true;
        } else if(result2.done) {
            result2.done = this.dispose() !== false;
        }
        
        return result2;
    }
    
    Subscriber.prototype.onNext = Subscriber.prototype["next"];
    Subscriber.prototype.onError = Subscriber.prototype["throw"];
    Subscriber.prototype.onCompleted = Subscriber.prototype["return"];
    
    Subscriber.empty = new Subscriber();
    
    return Subscriber;
    
    /**
     * Return false to signal unsubscribe, true to keep listening.
     */
     /*
    var f;
    onNext(x) {
        this._next = 
        return (
            // If we don't have an _next, return `false`.
            (f = this._next || false) &&
            // Capture onNext's return value.
            // 
            // 1. If the return value is not `false`, return whether the
            //    onNext function called dispose or not.
            // 2. If the return value is `false`, dispose of the Subscriber
            //    and return false.
            ((f = f.call(this, x) !== false) ? 
                !this.disposed :
                !this.disposed && this.dispose() && false)
        );
    }
    */
    
    /**
     * Return false to signal a successful unsubscribe.
     */
    /*
    onError(e) {
        return (
            // If we're already stopped, return `false`.
            (this.stopped === false) &&
            // If we don't have an onError function, return `false`.
            (f = this._throw || false) && (
                // Otherwise, set our stopped flag.
                (this.stopped = true) &&
                // Capture onError's return value.
                // 1. If the return value is not `false`, call dispose and return true.
                // 2. If the return value is `false`, return false.
                (f = f.call(this, e) !== false) && (!!this.dispose() || true))
        );
    }
    */
    
    /**
     * Return false to signal a successful unsubscribe.
     */
    /*
    onCompleted() {
        return (
            // If we're already stopped, return `false`.
            (this.stopped === false) &&
            // If we don't have an onCompleted function, return `false`.
            (f = this._return || false) && (
                // Otherwise, set our stopped flag.
                (this.stopped = true) &&
                // Capture onCompleted's return value.
                // 1. If the return value is not `false`, call dispose and return true.
                // 2. If the return value is `false`, return false.
                (f = f.call(this) !== false) && (!!this.dispose() || true))
        );
    }
    */
}();
