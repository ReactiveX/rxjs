import { __extends } from "tslib";

function isFunction(x) {
    return "function" === typeof x;
}

var _enable_super_gross_mode_that_will_cause_bad_things = false;

var config = {
    Promise: void 0,
    set useDeprecatedSynchronousErrorHandling(value) {
        if (value) {
            var error = new Error();
            console.warn("DEPRECATED! RxJS was set to use deprecated synchronous error handling behavior by code at: \n" + error.stack);
        }
        _enable_super_gross_mode_that_will_cause_bad_things = value;
    },
    get useDeprecatedSynchronousErrorHandling() {
        return _enable_super_gross_mode_that_will_cause_bad_things;
    }
};

function hostReportError(err) {
    setTimeout(function() {
        throw err;
    }, 0);
}

var empty = {
    closed: true,
    next: function(value) {},
    error: function(err) {
        if (config.useDeprecatedSynchronousErrorHandling) throw err; else hostReportError(err);
    },
    complete: function() {}
};

var isArray = Array.isArray || function(x) {
    return x && "number" === typeof x.length;
};

function isObject(x) {
    return null !== x && "object" === typeof x;
}

function UnsubscriptionErrorImpl(errors) {
    Error.call(this);
    this.message = errors ? errors.length + " errors occurred during unsubscription:\n" + errors.map(function(err, i) {
        return i + 1 + ") " + err.toString();
    }).join("\n  ") : "";
    this.name = "UnsubscriptionError";
    this.errors = errors;
    return this;
}

UnsubscriptionErrorImpl.prototype = Object.create(Error.prototype);

var UnsubscriptionError = UnsubscriptionErrorImpl;

var Subscription = function() {
    function Subscription(unsubscribe) {
        this.closed = false;
        this._parentOrParents = null;
        this._subscriptions = null;
        if (unsubscribe) this._unsubscribe = unsubscribe;
    }
    Subscription.prototype.unsubscribe = function() {
        var errors;
        if (this.closed) return;
        var _a = this, _parentOrParents = _a._parentOrParents, _unsubscribe = _a._unsubscribe, _subscriptions = _a._subscriptions;
        this.closed = true;
        this._parentOrParents = null;
        this._subscriptions = null;
        if (_parentOrParents instanceof Subscription) _parentOrParents.remove(this); else if (null !== _parentOrParents) for (var index = 0; index < _parentOrParents.length; ++index) {
            var parent_1 = _parentOrParents[index];
            parent_1.remove(this);
        }
        if (isFunction(_unsubscribe)) try {
            _unsubscribe.call(this);
        } catch (e) {
            errors = e instanceof UnsubscriptionError ? flattenUnsubscriptionErrors(e.errors) : [ e ];
        }
        if (isArray(_subscriptions)) {
            var index = -1;
            var len = _subscriptions.length;
            while (++index < len) {
                var sub = _subscriptions[index];
                if (isObject(sub)) try {
                    sub.unsubscribe();
                } catch (e) {
                    errors = errors || [];
                    if (e instanceof UnsubscriptionError) errors = errors.concat(flattenUnsubscriptionErrors(e.errors)); else errors.push(e);
                }
            }
        }
        if (errors) throw new UnsubscriptionError(errors);
    };
    Subscription.prototype.add = function(teardown) {
        var subscription = teardown;
        switch (typeof teardown) {
          case "function":
            subscription = new Subscription(teardown);

          case "object":
            if (subscription === this || subscription.closed || "function" !== typeof subscription.unsubscribe) return subscription; else if (this.closed) {
                subscription.unsubscribe();
                return subscription;
            } else if (!(subscription instanceof Subscription)) {
                var tmp = subscription;
                subscription = new Subscription();
                subscription._subscriptions = [ tmp ];
            }
            break;

          default:
            if (!teardown) return Subscription.EMPTY;
            throw new Error("unrecognized teardown " + teardown + " added to Subscription.");
        }
        var _parentOrParents = subscription._parentOrParents;
        if (null === _parentOrParents) subscription._parentOrParents = this; else if (_parentOrParents instanceof Subscription) {
            if (_parentOrParents === this) return subscription;
            subscription._parentOrParents = [ _parentOrParents, this ];
        } else if (-1 === _parentOrParents.indexOf(this)) _parentOrParents.push(this); else return subscription;
        var subscriptions = this._subscriptions;
        if (null === subscriptions) this._subscriptions = [ subscription ]; else subscriptions.push(subscription);
        return subscription;
    };
    Subscription.prototype.remove = function(subscription) {
        var subscriptions = this._subscriptions;
        if (subscriptions) {
            var subscriptionIndex = subscriptions.indexOf(subscription);
            if (-1 !== subscriptionIndex) subscriptions.splice(subscriptionIndex, 1);
        }
    };
    Subscription.EMPTY = function(empty) {
        empty.closed = true;
        return empty;
    }(new Subscription());
    return Subscription;
}();

function flattenUnsubscriptionErrors(errors) {
    return errors.reduce(function(errs, err) {
        return errs.concat(err instanceof UnsubscriptionError ? err.errors : err);
    }, []);
}

var rxSubscriber = "function" === typeof Symbol ? Symbol("rxSubscriber") : "@@rxSubscriber_" + Math.random();

var Subscriber = function(_super) {
    __extends(Subscriber, _super);
    function Subscriber(destinationOrNext, error, complete) {
        var _this = _super.call(this) || this;
        _this.syncErrorValue = null;
        _this.syncErrorThrown = false;
        _this.syncErrorThrowable = false;
        _this.isStopped = false;
        switch (arguments.length) {
          case 0:
            _this.destination = empty;
            break;

          case 1:
            if (!destinationOrNext) {
                _this.destination = empty;
                break;
            }
            if ("object" === typeof destinationOrNext) {
                if (destinationOrNext instanceof Subscriber) {
                    _this.syncErrorThrowable = destinationOrNext.syncErrorThrowable;
                    _this.destination = destinationOrNext;
                    destinationOrNext.add(_this);
                } else {
                    _this.syncErrorThrowable = true;
                    _this.destination = new SafeSubscriber(_this, destinationOrNext);
                }
                break;
            }

          default:
            _this.syncErrorThrowable = true;
            _this.destination = new SafeSubscriber(_this, destinationOrNext, error, complete);
            break;
        }
        return _this;
    }
    Subscriber.prototype[rxSubscriber] = function() {
        return this;
    };
    Subscriber.create = function(next, error, complete) {
        var subscriber = new Subscriber(next, error, complete);
        subscriber.syncErrorThrowable = false;
        return subscriber;
    };
    Subscriber.prototype.next = function(value) {
        if (!this.isStopped) this._next(value);
    };
    Subscriber.prototype.error = function(err) {
        if (!this.isStopped) {
            this.isStopped = true;
            this._error(err);
        }
    };
    Subscriber.prototype.complete = function() {
        if (!this.isStopped) {
            this.isStopped = true;
            this._complete();
        }
    };
    Subscriber.prototype.unsubscribe = function() {
        if (this.closed) return;
        this.isStopped = true;
        _super.prototype.unsubscribe.call(this);
    };
    Subscriber.prototype._next = function(value) {
        this.destination.next(value);
    };
    Subscriber.prototype._error = function(err) {
        this.destination.error(err);
        this.unsubscribe();
    };
    Subscriber.prototype._complete = function() {
        this.destination.complete();
        this.unsubscribe();
    };
    Subscriber.prototype._unsubscribeAndRecycle = function() {
        var _parentOrParents = this._parentOrParents;
        this._parentOrParents = null;
        this.unsubscribe();
        this.closed = false;
        this.isStopped = false;
        this._parentOrParents = _parentOrParents;
        return this;
    };
    return Subscriber;
}(Subscription);

var SafeSubscriber = function(_super) {
    __extends(SafeSubscriber, _super);
    function SafeSubscriber(_parentSubscriber, observerOrNext, error, complete) {
        var _this = _super.call(this) || this;
        _this._parentSubscriber = _parentSubscriber;
        var next;
        var context = _this;
        if (isFunction(observerOrNext)) next = observerOrNext; else if (observerOrNext) {
            next = observerOrNext.next;
            error = observerOrNext.error;
            complete = observerOrNext.complete;
            if (observerOrNext !== empty) {
                context = Object.create(observerOrNext);
                if (isFunction(context.unsubscribe)) _this.add(context.unsubscribe.bind(context));
                context.unsubscribe = _this.unsubscribe.bind(_this);
            }
        }
        _this._context = context;
        _this._next = next;
        _this._error = error;
        _this._complete = complete;
        return _this;
    }
    SafeSubscriber.prototype.next = function(value) {
        if (!this.isStopped && this._next) {
            var _parentSubscriber = this._parentSubscriber;
            if (!config.useDeprecatedSynchronousErrorHandling || !_parentSubscriber.syncErrorThrowable) this.__tryOrUnsub(this._next, value); else if (this.__tryOrSetError(_parentSubscriber, this._next, value)) this.unsubscribe();
        }
    };
    SafeSubscriber.prototype.error = function(err) {
        if (!this.isStopped) {
            var _parentSubscriber = this._parentSubscriber;
            var useDeprecatedSynchronousErrorHandling = config.useDeprecatedSynchronousErrorHandling;
            if (this._error) if (!useDeprecatedSynchronousErrorHandling || !_parentSubscriber.syncErrorThrowable) {
                this.__tryOrUnsub(this._error, err);
                this.unsubscribe();
            } else {
                this.__tryOrSetError(_parentSubscriber, this._error, err);
                this.unsubscribe();
            } else if (!_parentSubscriber.syncErrorThrowable) {
                this.unsubscribe();
                if (useDeprecatedSynchronousErrorHandling) throw err;
                hostReportError(err);
            } else {
                if (useDeprecatedSynchronousErrorHandling) {
                    _parentSubscriber.syncErrorValue = err;
                    _parentSubscriber.syncErrorThrown = true;
                } else hostReportError(err);
                this.unsubscribe();
            }
        }
    };
    SafeSubscriber.prototype.complete = function() {
        var _this = this;
        if (!this.isStopped) {
            var _parentSubscriber = this._parentSubscriber;
            if (this._complete) {
                var wrappedComplete = function() {
                    return _this._complete.call(_this._context);
                };
                if (!config.useDeprecatedSynchronousErrorHandling || !_parentSubscriber.syncErrorThrowable) {
                    this.__tryOrUnsub(wrappedComplete);
                    this.unsubscribe();
                } else {
                    this.__tryOrSetError(_parentSubscriber, wrappedComplete);
                    this.unsubscribe();
                }
            } else this.unsubscribe();
        }
    };
    SafeSubscriber.prototype.__tryOrUnsub = function(fn, value) {
        try {
            fn.call(this._context, value);
        } catch (err) {
            this.unsubscribe();
            if (config.useDeprecatedSynchronousErrorHandling) throw err; else hostReportError(err);
        }
    };
    SafeSubscriber.prototype.__tryOrSetError = function(parent, fn, value) {
        if (!config.useDeprecatedSynchronousErrorHandling) throw new Error("bad call");
        try {
            fn.call(this._context, value);
        } catch (err) {
            if (config.useDeprecatedSynchronousErrorHandling) {
                parent.syncErrorValue = err;
                parent.syncErrorThrown = true;
                return true;
            } else {
                hostReportError(err);
                return true;
            }
        }
        return false;
    };
    SafeSubscriber.prototype._unsubscribe = function() {
        var _parentSubscriber = this._parentSubscriber;
        this._context = null;
        this._parentSubscriber = null;
        _parentSubscriber.unsubscribe();
    };
    return SafeSubscriber;
}(Subscriber);

function canReportError(observer) {
    while (observer) {
        var _a = observer, closed_1 = _a.closed, destination = _a.destination, isStopped = _a.isStopped;
        if (closed_1 || isStopped) return false; else if (destination && destination instanceof Subscriber) observer = destination; else observer = null;
    }
    return true;
}

function toSubscriber(nextOrObserver, error, complete) {
    if (nextOrObserver) {
        if (nextOrObserver instanceof Subscriber) return nextOrObserver;
        if (nextOrObserver[rxSubscriber]) return nextOrObserver[rxSubscriber]();
    }
    if (!nextOrObserver && !error && !complete) return new Subscriber(empty);
    return new Subscriber(nextOrObserver, error, complete);
}

var observable = "function" === typeof Symbol && Symbol.observable || "@@observable";

function noop() {}

function pipeFromArray(fns) {
    if (!fns) return noop;
    if (1 === fns.length) return fns[0];
    return function piped(input) {
        return fns.reduce(function(prev, fn) {
            return fn(prev);
        }, input);
    };
}

var Observable = function() {
    function Observable(subscribe) {
        this._isScalar = false;
        if (subscribe) this._subscribe = subscribe;
    }
    Observable.prototype.lift = function(operator) {
        var observable = new Observable();
        observable.source = this;
        observable.operator = operator;
        return observable;
    };
    Observable.prototype.subscribe = function(observerOrNext, error, complete) {
        var operator = this.operator;
        var sink = toSubscriber(observerOrNext, error, complete);
        if (operator) sink.add(operator.call(sink, this.source)); else sink.add(this.source || config.useDeprecatedSynchronousErrorHandling && !sink.syncErrorThrowable ? this._subscribe(sink) : this._trySubscribe(sink));
        if (config.useDeprecatedSynchronousErrorHandling) if (sink.syncErrorThrowable) {
            sink.syncErrorThrowable = false;
            if (sink.syncErrorThrown) throw sink.syncErrorValue;
        }
        return sink;
    };
    Observable.prototype._trySubscribe = function(sink) {
        try {
            return this._subscribe(sink);
        } catch (err) {
            if (config.useDeprecatedSynchronousErrorHandling) {
                sink.syncErrorThrown = true;
                sink.syncErrorValue = err;
            }
            if (canReportError(sink)) sink.error(err); else console.warn(err);
        }
    };
    Observable.prototype.forEach = function(next, promiseCtor) {
        var _this = this;
        promiseCtor = getPromiseCtor(promiseCtor);
        return new promiseCtor(function(resolve, reject) {
            var subscription;
            subscription = _this.subscribe(function(value) {
                try {
                    next(value);
                } catch (err) {
                    reject(err);
                    if (subscription) subscription.unsubscribe();
                }
            }, reject, resolve);
        });
    };
    Observable.prototype._subscribe = function(subscriber) {
        var source = this.source;
        return source && source.subscribe(subscriber);
    };
    Observable.prototype[observable] = function() {
        return this;
    };
    Observable.prototype.pipe = function() {
        var operations = [];
        for (var _i = 0; _i < arguments.length; _i++) operations[_i] = arguments[_i];
        if (0 === operations.length) return this;
        return pipeFromArray(operations)(this);
    };
    Observable.prototype.toPromise = function(promiseCtor) {
        var _this = this;
        promiseCtor = getPromiseCtor(promiseCtor);
        return new promiseCtor(function(resolve, reject) {
            var value;
            _this.subscribe(function(x) {
                return value = x;
            }, function(err) {
                return reject(err);
            }, function() {
                return resolve(value);
            });
        });
    };
    Observable.create = function(subscribe) {
        return new Observable(subscribe);
    };
    return Observable;
}();

function getPromiseCtor(promiseCtor) {
    if (!promiseCtor) promiseCtor = Promise;
    if (!promiseCtor) throw new Error("no Promise impl found");
    return promiseCtor;
}

var SubjectSubscriber = function(_super) {
    __extends(SubjectSubscriber, _super);
    function SubjectSubscriber(destination) {
        var _this = _super.call(this, destination) || this;
        _this.destination = destination;
        return _this;
    }
    return SubjectSubscriber;
}(Subscriber);

function refCount() {
    return function refCountOperatorFunction(source) {
        return source.lift(new RefCountOperator(source));
    };
}

var RefCountOperator = function() {
    function RefCountOperator(connectable) {
        this.connectable = connectable;
    }
    RefCountOperator.prototype.call = function(subscriber, source) {
        var connectable = this.connectable;
        connectable._refCount++;
        var refCounter = new RefCountSubscriber(subscriber, connectable);
        var subscription = source.subscribe(refCounter);
        if (!refCounter.closed) refCounter.connection = connectable.connect();
        return subscription;
    };
    return RefCountOperator;
}();

var RefCountSubscriber = function(_super) {
    __extends(RefCountSubscriber, _super);
    function RefCountSubscriber(destination, connectable) {
        var _this = _super.call(this, destination) || this;
        _this.connectable = connectable;
        return _this;
    }
    RefCountSubscriber.prototype._unsubscribe = function() {
        var connectable = this.connectable;
        if (!connectable) {
            this.connection = null;
            return;
        }
        this.connectable = null;
        var refCount = connectable._refCount;
        if (refCount <= 0) {
            this.connection = null;
            return;
        }
        connectable._refCount = refCount - 1;
        if (refCount > 1) {
            this.connection = null;
            return;
        }
        var connection = this.connection;
        var sharedConnection = connectable._connection;
        this.connection = null;
        if (sharedConnection && (!connection || sharedConnection === connection)) sharedConnection.unsubscribe();
    };
    return RefCountSubscriber;
}(Subscriber);

var ConnectableObservable = function(_super) {
    __extends(ConnectableObservable, _super);
    function ConnectableObservable(source, subjectFactory) {
        var _this = _super.call(this) || this;
        _this.source = source;
        _this.subjectFactory = subjectFactory;
        _this._refCount = 0;
        _this._isComplete = false;
        return _this;
    }
    ConnectableObservable.prototype._subscribe = function(subscriber) {
        return this.getSubject().subscribe(subscriber);
    };
    ConnectableObservable.prototype.getSubject = function() {
        var subject = this._subject;
        if (!subject || subject.isStopped) this._subject = this.subjectFactory();
        return this._subject;
    };
    ConnectableObservable.prototype.connect = function() {
        var connection = this._connection;
        if (!connection) {
            this._isComplete = false;
            connection = this._connection = new Subscription();
            connection.add(this.source.subscribe(new ConnectableSubscriber(this.getSubject(), this)));
            if (connection.closed) {
                this._connection = null;
                connection = Subscription.EMPTY;
            }
        }
        return connection;
    };
    ConnectableObservable.prototype.refCount = function() {
        return refCount()(this);
    };
    return ConnectableObservable;
}(Observable);

var connectableProto = ConnectableObservable.prototype;

var connectableObservableDescriptor = {
    operator: {
        value: null
    },
    _refCount: {
        value: 0,
        writable: true
    },
    _subject: {
        value: null,
        writable: true
    },
    _connection: {
        value: null,
        writable: true
    },
    _subscribe: {
        value: connectableProto._subscribe
    },
    _isComplete: {
        value: connectableProto._isComplete,
        writable: true
    },
    getSubject: {
        value: connectableProto.getSubject
    },
    connect: {
        value: connectableProto.connect
    },
    refCount: {
        value: connectableProto.refCount
    }
};

var ConnectableSubscriber = function(_super) {
    __extends(ConnectableSubscriber, _super);
    function ConnectableSubscriber(destination, connectable) {
        var _this = _super.call(this, destination) || this;
        _this.connectable = connectable;
        return _this;
    }
    ConnectableSubscriber.prototype._error = function(err) {
        this._unsubscribe();
        _super.prototype._error.call(this, err);
    };
    ConnectableSubscriber.prototype._complete = function() {
        this.connectable._isComplete = true;
        this._unsubscribe();
        _super.prototype._complete.call(this);
    };
    ConnectableSubscriber.prototype._unsubscribe = function() {
        var connectable = this.connectable;
        if (connectable) {
            this.connectable = null;
            var connection = connectable._connection;
            connectable._refCount = 0;
            connectable._subject = null;
            connectable._connection = null;
            if (connection) connection.unsubscribe();
        }
    };
    return ConnectableSubscriber;
}(SubjectSubscriber);
