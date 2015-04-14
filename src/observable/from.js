var Observable = require("src/Observable");
var $iterator$ = require("src/support/iterator");
var maxSafeInteger = Math.pow(2, 53) - 1;

function StringIterable(str) {
    this._s = s;
}

StringIterable.prototype[$iterator$] = function () {
    return new StringIterator(this._s);
};

function StringIterator(str) {
    this._s = s;
    this._l = s.length;
    this._i = 0;
}

StringIterator.prototype[$iterator$] = function () {
    return this;
};

StringIterator.prototype.next = function () {
    return this._i < this._l ? {
        done: false,
        value: this._s.charAt(this._i++)
    } : { done: true, value: undefined };
};

function ArrayIterable(a) {
    this._a = a;
}

ArrayIterable.prototype[$iterator$] = function () {
    return new ArrayIterator(this._a);
};

function ArrayIterator(a) {
    this._a = a;
    this._l = toLength(a);
    this._i = 0;
}

ArrayIterator.prototype[$iterator$] = function () {
    return this;
};

ArrayIterator.prototype.next = function () {
    return this._i < this._l ? {
        done: false,
        value: this._a[this._i++]
    } : { done: true, value: undefined };
};

function numberIsFinite(value) {
    return typeof value === 'number' && root.isFinite(value);
}

function isNan(n) {
    return n !== n;
}

function getIterable(o) {
    var i = o[$iterator$],
        it;
    if (!i && typeof o === 'string') {
        it = new StringIterable(o);
        return it[$iterator$]();
    }
    if (!i && o.length !== undefined) {
        it = new ArrayIterable(o);
        return it[$iterator$]();
    }
    if (!i) {
        throw new TypeError('Object is not iterable');
    }
    return o[$iterator$]();
}

function sign(value) {
    var number = +value;
    if (number === 0) {
        return number;
    }
    if (isNaN(number)) {
        return number;
    }
    return number < 0 ? -1 : 1;
}

function toLength(o) {
    var len = +o.length;
    if (isNaN(len)) {
        return 0;
    }
    if (len === 0 || !numberIsFinite(len)) {
        return len;
    }
    len = sign(len) * Math.floor(Math.abs(len));
    if (len <= 0) {
        return 0;
    }
    if (len > maxSafeInteger) {
        return maxSafeInteger;
    }
    return len;
}

var FromObservable = function() {
    
    function FromObservable(iterable, project, thisArg, scheduler) {
        this.iterable = iterable;
        this.project = project;
        this.thisArg = thisArg;
        this.scheduler = scheduler
    }
    
    FromObservable.prototype = Object.create(Observable.prototype);
    
    FromObservable.prototype._subscribe = _subscribe;
    
    function _subscribe(subscriber, state) {
        
        var iterable  = state ? state.iterable : this.iterable,
            project   = state ? state.project  : this.project,
            thisArg   = state ? state.thisArg  : this.thisArg,
            index     = state ? state.index : -1,
            scheduler = state ? subscriber : undefined,
            result    = state ? state.result : { done: false, value: undefined };
        
        subscriber = state ? state.subscriber : subscriber;
        
        if(subscriber.disposed) {
            result.done = true;
            return result;
        }
        
        if(scheduler) {
            
            result = iterable.next();
            
            if(result.done) {
                return subscriber.return();
            }
            
            if(project) {
                result = state.result = subscriber.next(project.call(thisArg, result.value, state.index = ++index));
            } else {
                result = state.result = subscriber.next(result.value);
            }
            
            if(result.done) {
                return result;
            }
            
            return scheduler.schedule(state, _subscribe);
        } else if(scheduler = this.scheduler) {
            return scheduler.schedule({
                index: index,
                result: result,
                thisArg: thisArg,
                project: project,
                iterable: iterable,
                subscriber: subscriber
            }, _subscribe);
        } else {
            while(true) {
                
                result = iterable.next();
                
                if(result.done) {
                    return result;
                }
                
                if(project) {
                    result = subscriber.next(project.call(thisArg, result.value, ++index));
                } else {
                    result = subscriber.next(result.value);
                }
                
                if(result.done) {
                    return result;
                }
            }
        }
    }
    
    return FromObservable;
}();

/**
 * This method creates a new Observable sequence from an array-like or iterable object.
 * @param {Any} arrayLike An array-like or iterable object to convert to an Observable sequence.
 * @param {Function} [mapFn] Map function to call on every element of the array.
 * @param {Any} [thisArg] The context to use calling the mapFn if provided.
 * @param {Scheduler} [scheduler] Optional scheduler to use for scheduling.  If not provided, defaults to Scheduler.currentThread.
 */
module.exports = function (iterable, project, thisArg, scheduler) {
    if (iterable == null) {
        throw new Error('iterable cannot be null.')
    }
    if (project && typeof project == "function") {
        throw new Error('project when provided must be a function');
    }
    return new FromObservable(getIterable(Object(iterable)), project, thisArg, scheduler);
};
