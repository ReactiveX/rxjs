function isFunction(x) {
    return "function" === typeof x;
}

let _enable_super_gross_mode_that_will_cause_bad_things = false;

const config = {
    Promise: void 0,
    set useDeprecatedSynchronousErrorHandling(value) {
        _enable_super_gross_mode_that_will_cause_bad_things = value;
    },
    get useDeprecatedSynchronousErrorHandling() {
        return _enable_super_gross_mode_that_will_cause_bad_things;
    }
};

function hostReportError(err) {
    setTimeout(() => {
        throw err;
    }, 0);
}

const empty = {
    closed: true,
    next(value) {},
    error(err) {
        if (config.useDeprecatedSynchronousErrorHandling) throw err; else hostReportError(err);
    },
    complete() {}
};

const isArray = Array.isArray || (x => x && "number" === typeof x.length);

function isObject(x) {
    return null !== x && "object" === typeof x;
}

function UnsubscriptionErrorImpl(errors) {
    Error.call(this);
    this.message = errors ? `${errors.length} errors occurred during unsubscription:\n${errors.map((err, i) => `${i + 1}) ${err.toString()}`).join("\n  ")}` : "";
    this.name = "UnsubscriptionError";
    this.errors = errors;
    return this;
}

UnsubscriptionErrorImpl.prototype = Object.create(Error.prototype);

const UnsubscriptionError = UnsubscriptionErrorImpl;

const Subscription = function() {
    class Subscription {
        constructor(unsubscribe) {
            this.closed = false;
            this._parentOrParents = null;
            this._subscriptions = null;
            if (unsubscribe) this._unsubscribe = unsubscribe;
        }
        unsubscribe() {
            let errors;
            if (this.closed) return;
            let {_parentOrParents: _parentOrParents, _unsubscribe: _unsubscribe, _subscriptions: _subscriptions} = this;
            this.closed = true;
            this._parentOrParents = null;
            this._subscriptions = null;
            if (_parentOrParents instanceof Subscription) _parentOrParents.remove(this); else if (null !== _parentOrParents) for (let index = 0; index < _parentOrParents.length; ++index) {
                const parent = _parentOrParents[index];
                parent.remove(this);
            }
            if (isFunction(_unsubscribe)) try {
                _unsubscribe.call(this);
            } catch (e) {
                errors = e instanceof UnsubscriptionError ? flattenUnsubscriptionErrors(e.errors) : [ e ];
            }
            if (isArray(_subscriptions)) {
                let index = -1;
                let len = _subscriptions.length;
                while (++index < len) {
                    const sub = _subscriptions[index];
                    if (isObject(sub)) try {
                        sub.unsubscribe();
                    } catch (e) {
                        errors = errors || [];
                        if (e instanceof UnsubscriptionError) errors = errors.concat(flattenUnsubscriptionErrors(e.errors)); else errors.push(e);
                    }
                }
            }
            if (errors) throw new UnsubscriptionError(errors);
        }
        add(teardown) {
            let subscription = teardown;
            switch (typeof teardown) {
              case "function":
                subscription = new Subscription(teardown);

              case "object":
                if (subscription === this || subscription.closed || "function" !== typeof subscription.unsubscribe) return subscription; else if (this.closed) {
                    subscription.unsubscribe();
                    return subscription;
                } else if (!(subscription instanceof Subscription)) {
                    const tmp = subscription;
                    subscription = new Subscription();
                    subscription._subscriptions = [ tmp ];
                }
                break;

              default:
                if (!teardown) return Subscription.EMPTY;
                throw new Error("unrecognized teardown " + teardown + " added to Subscription.");
            }
            let {_parentOrParents: _parentOrParents} = subscription;
            if (null === _parentOrParents) subscription._parentOrParents = this; else if (_parentOrParents instanceof Subscription) {
                if (_parentOrParents === this) return subscription;
                subscription._parentOrParents = [ _parentOrParents, this ];
            } else if (-1 === _parentOrParents.indexOf(this)) _parentOrParents.push(this); else return subscription;
            const subscriptions = this._subscriptions;
            if (null === subscriptions) this._subscriptions = [ subscription ]; else subscriptions.push(subscription);
            return subscription;
        }
        remove(subscription) {
            const subscriptions = this._subscriptions;
            if (subscriptions) {
                const subscriptionIndex = subscriptions.indexOf(subscription);
                if (-1 !== subscriptionIndex) subscriptions.splice(subscriptionIndex, 1);
            }
        }
    }
    Subscription.EMPTY = function(empty) {
        empty.closed = true;
        return empty;
    }(new Subscription());
    return Subscription;
}();

function flattenUnsubscriptionErrors(errors) {
    return errors.reduce((errs, err) => errs.concat(err instanceof UnsubscriptionError ? err.errors : err), []);
}

const rxSubscriber = "function" === typeof Symbol ? Symbol("rxSubscriber") : "@@rxSubscriber_" + Math.random();

class Subscriber extends Subscription {
    constructor(destinationOrNext, error, complete) {
        super();
        this.syncErrorValue = null;
        this.syncErrorThrown = false;
        this.syncErrorThrowable = false;
        this.isStopped = false;
        switch (arguments.length) {
          case 0:
            this.destination = empty;
            break;

          case 1:
            if (!destinationOrNext) {
                this.destination = empty;
                break;
            }
            if ("object" === typeof destinationOrNext) {
                if (destinationOrNext instanceof Subscriber) {
                    this.syncErrorThrowable = destinationOrNext.syncErrorThrowable;
                    this.destination = destinationOrNext;
                    destinationOrNext.add(this);
                } else {
                    this.syncErrorThrowable = true;
                    this.destination = new SafeSubscriber(this, destinationOrNext);
                }
                break;
            }

          default:
            this.syncErrorThrowable = true;
            this.destination = new SafeSubscriber(this, destinationOrNext, error, complete);
            break;
        }
    }
    [rxSubscriber]() {
        return this;
    }
    static create(next, error, complete) {
        const subscriber = new Subscriber(next, error, complete);
        subscriber.syncErrorThrowable = false;
        return subscriber;
    }
    next(value) {
        if (!this.isStopped) this._next(value);
    }
    error(err) {
        if (!this.isStopped) {
            this.isStopped = true;
            this._error(err);
        }
    }
    complete() {
        if (!this.isStopped) {
            this.isStopped = true;
            this._complete();
        }
    }
    unsubscribe() {
        if (this.closed) return;
        this.isStopped = true;
        super.unsubscribe();
    }
    _next(value) {
        this.destination.next(value);
    }
    _error(err) {
        this.destination.error(err);
        this.unsubscribe();
    }
    _complete() {
        this.destination.complete();
        this.unsubscribe();
    }
    _unsubscribeAndRecycle() {
        const {_parentOrParents: _parentOrParents} = this;
        this._parentOrParents = null;
        this.unsubscribe();
        this.closed = false;
        this.isStopped = false;
        this._parentOrParents = _parentOrParents;
        return this;
    }
}

class SafeSubscriber extends Subscriber {
    constructor(_parentSubscriber, observerOrNext, error, complete) {
        super();
        this._parentSubscriber = _parentSubscriber;
        let next;
        let context = this;
        if (isFunction(observerOrNext)) next = observerOrNext; else if (observerOrNext) {
            next = observerOrNext.next;
            error = observerOrNext.error;
            complete = observerOrNext.complete;
            if (observerOrNext !== empty) {
                context = Object.create(observerOrNext);
                if (isFunction(context.unsubscribe)) this.add(context.unsubscribe.bind(context));
                context.unsubscribe = this.unsubscribe.bind(this);
            }
        }
        this._context = context;
        this._next = next;
        this._error = error;
        this._complete = complete;
    }
    next(value) {
        if (!this.isStopped && this._next) {
            const {_parentSubscriber: _parentSubscriber} = this;
            if (!config.useDeprecatedSynchronousErrorHandling || !_parentSubscriber.syncErrorThrowable) this.__tryOrUnsub(this._next, value); else if (this.__tryOrSetError(_parentSubscriber, this._next, value)) this.unsubscribe();
        }
    }
    error(err) {
        if (!this.isStopped) {
            const {_parentSubscriber: _parentSubscriber} = this;
            const {useDeprecatedSynchronousErrorHandling: useDeprecatedSynchronousErrorHandling} = config;
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
    }
    complete() {
        if (!this.isStopped) {
            const {_parentSubscriber: _parentSubscriber} = this;
            if (this._complete) {
                const wrappedComplete = () => this._complete.call(this._context);
                if (!config.useDeprecatedSynchronousErrorHandling || !_parentSubscriber.syncErrorThrowable) {
                    this.__tryOrUnsub(wrappedComplete);
                    this.unsubscribe();
                } else {
                    this.__tryOrSetError(_parentSubscriber, wrappedComplete);
                    this.unsubscribe();
                }
            } else this.unsubscribe();
        }
    }
    __tryOrUnsub(fn, value) {
        try {
            fn.call(this._context, value);
        } catch (err) {
            this.unsubscribe();
            if (config.useDeprecatedSynchronousErrorHandling) throw err; else hostReportError(err);
        }
    }
    __tryOrSetError(parent, fn, value) {
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
    }
    _unsubscribe() {
        const {_parentSubscriber: _parentSubscriber} = this;
        this._context = null;
        this._parentSubscriber = null;
        _parentSubscriber.unsubscribe();
    }
}

const observable = "function" === typeof Symbol && Symbol.observable || "@@observable";

function canReportError(observer) {
    while (observer) {
        const {closed: closed, destination: destination, isStopped: isStopped} = observer;
        if (closed || isStopped) return false; else if (destination && destination instanceof Subscriber) observer = destination; else observer = null;
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

function noop() {}

function pipeFromArray(fns) {
    if (!fns) return noop;
    if (1 === fns.length) return fns[0];
    return function piped(input) {
        return fns.reduce((prev, fn) => fn(prev), input);
    };
}

const Observable = function() {
    class Observable {
        constructor(subscribe) {
            this._isScalar = false;
            if (subscribe) this._subscribe = subscribe;
        }
        lift(operator) {
            const observable = new Observable();
            observable.source = this;
            observable.operator = operator;
            return observable;
        }
        subscribe(observerOrNext, error, complete) {
            const {operator: operator} = this;
            const sink = toSubscriber(observerOrNext, error, complete);
            if (operator) sink.add(operator.call(sink, this.source)); else sink.add(this.source || config.useDeprecatedSynchronousErrorHandling && !sink.syncErrorThrowable ? this._subscribe(sink) : this._trySubscribe(sink));
            if (config.useDeprecatedSynchronousErrorHandling) if (sink.syncErrorThrowable) {
                sink.syncErrorThrowable = false;
                if (sink.syncErrorThrown) throw sink.syncErrorValue;
            }
            return sink;
        }
        _trySubscribe(sink) {
            try {
                return this._subscribe(sink);
            } catch (err) {
                if (config.useDeprecatedSynchronousErrorHandling) {
                    sink.syncErrorThrown = true;
                    sink.syncErrorValue = err;
                }
                if (canReportError(sink)) sink.error(err); else console.warn(err);
            }
        }
        forEach(next, promiseCtor) {
            promiseCtor = getPromiseCtor(promiseCtor);
            return new promiseCtor((resolve, reject) => {
                let subscription;
                subscription = this.subscribe(value => {
                    try {
                        next(value);
                    } catch (err) {
                        reject(err);
                        if (subscription) subscription.unsubscribe();
                    }
                }, reject, resolve);
            });
        }
        _subscribe(subscriber) {
            const {source: source} = this;
            return source && source.subscribe(subscriber);
        }
        [observable]() {
            return this;
        }
        pipe(...operations) {
            if (0 === operations.length) return this;
            return pipeFromArray(operations)(this);
        }
        toPromise(promiseCtor) {
            promiseCtor = getPromiseCtor(promiseCtor);
            return new promiseCtor((resolve, reject) => {
                let value;
                this.subscribe(x => value = x, err => reject(err), () => resolve(value));
            });
        }
    }
    Observable.create = (subscribe => {
        return new Observable(subscribe);
    });
    return Observable;
}();

function getPromiseCtor(promiseCtor) {
    if (!promiseCtor) promiseCtor = Promise;
    if (!promiseCtor) throw new Error("no Promise impl found");
    return promiseCtor;
}

var NotificationKind;

(function(NotificationKind) {
    NotificationKind["NEXT"] = "N";
    NotificationKind["ERROR"] = "E";
    NotificationKind["COMPLETE"] = "C";
})(NotificationKind || (NotificationKind = {}));

class SubjectSubscriber extends Subscriber {
    constructor(destination) {
        super(destination);
        this.destination = destination;
    }
}

function refCount() {
    return function refCountOperatorFunction(source) {
        return source.lift(new RefCountOperator(source));
    };
}

class RefCountOperator {
    constructor(connectable) {
        this.connectable = connectable;
    }
    call(subscriber, source) {
        const {connectable: connectable} = this;
        connectable._refCount++;
        const refCounter = new RefCountSubscriber(subscriber, connectable);
        const subscription = source.subscribe(refCounter);
        if (!refCounter.closed) refCounter.connection = connectable.connect();
        return subscription;
    }
}

class RefCountSubscriber extends Subscriber {
    constructor(destination, connectable) {
        super(destination);
        this.connectable = connectable;
    }
    _unsubscribe() {
        const {connectable: connectable} = this;
        if (!connectable) {
            this.connection = null;
            return;
        }
        this.connectable = null;
        const refCount = connectable._refCount;
        if (refCount <= 0) {
            this.connection = null;
            return;
        }
        connectable._refCount = refCount - 1;
        if (refCount > 1) {
            this.connection = null;
            return;
        }
        const {connection: connection} = this;
        const sharedConnection = connectable._connection;
        this.connection = null;
        if (sharedConnection && (!connection || sharedConnection === connection)) sharedConnection.unsubscribe();
    }
}

class ConnectableObservable extends Observable {
    constructor(source, subjectFactory) {
        super();
        this.source = source;
        this.subjectFactory = subjectFactory;
        this._refCount = 0;
        this._isComplete = false;
    }
    _subscribe(subscriber) {
        return this.getSubject().subscribe(subscriber);
    }
    getSubject() {
        const subject = this._subject;
        if (!subject || subject.isStopped) this._subject = this.subjectFactory();
        return this._subject;
    }
    connect() {
        let connection = this._connection;
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
    }
    refCount() {
        return refCount()(this);
    }
}

const connectableProto = ConnectableObservable.prototype;

const connectableObservableDescriptor = {
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

class ConnectableSubscriber extends SubjectSubscriber {
    constructor(destination, connectable) {
        super(destination);
        this.connectable = connectable;
    }
    _error(err) {
        this._unsubscribe();
        super._error(err);
    }
    _complete() {
        this.connectable._isComplete = true;
        this._unsubscribe();
        super._complete();
    }
    _unsubscribe() {
        const connectable = this.connectable;
        if (connectable) {
            this.connectable = null;
            const connection = connectable._connection;
            connectable._refCount = 0;
            connectable._subject = null;
            connectable._connection = null;
            if (connection) connection.unsubscribe();
        }
    }
}
