import { __spreadArrays, __extends } from "tslib";

function isFunction(x) {
    return "function" === typeof x;
}

var _enable_super_gross_mode_that_will_cause_bad_things = false;

var _enable_deoptimized_subscriber_creation = false;

var config = {
    quietBadConfig: false,
    Promise: void 0,
    set useDeprecatedSynchronousErrorHandling(value) {
        if (!this.quietBadConfig) if (value) {
            var error = new Error();
            console.warn("DEPRECATED! RxJS was set to use deprecated synchronous error handling behavior by code at: \n" + error.stack);
        }
        _enable_super_gross_mode_that_will_cause_bad_things = value;
    },
    get useDeprecatedSynchronousErrorHandling() {
        return _enable_super_gross_mode_that_will_cause_bad_things;
    },
    set useDeprecatedNextContext(value) {
        if (!this.quietBadConfig) if (value) {
            var error = new Error();
            console.warn("DEPRECATED! RxJS was set to use deprecated next context. This will result in deoptimizations when creating any new subscription. \n" + error.stack);
        }
        _enable_deoptimized_subscriber_creation = value;
    },
    get useDeprecatedNextContext() {
        return _enable_deoptimized_subscriber_creation;
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

function createErrorClass(createImpl) {
    var _super = function(instance) {
        Error.call(instance);
        instance.name = instance.constructor.name;
        instance.stack = new Error().stack;
    };
    var ctorFunc = createImpl(_super);
    ctorFunc.prototype = Object.create(Error.prototype);
    ctorFunc.prototype.constructor = ctorFunc;
    return ctorFunc;
}

var UnsubscriptionError = createErrorClass(function(_super) {
    return function UnsubscriptionError(errors) {
        _super(this);
        this.message = errors ? errors.length + " errors occurred during unsubscription:\n" + errors.map(function(err, i) {
            return i + 1 + ") " + err.toString();
        }).join("\n  ") : "";
        this.name = "UnsubscriptionError";
        this.errors = errors;
        return this;
    };
});

var Subscription = function() {
    function Subscription(initialTeardown) {
        this.initialTeardown = initialTeardown;
        this.closed = false;
        this._singleParent = null;
        this._parents = null;
        this._teardowns = null;
    }
    Subscription.prototype.unsubscribe = function() {
        var errors;
        if (!this.closed) {
            this.closed = true;
            var _singleParent = this._singleParent;
            var _parents = void 0;
            if (_singleParent) {
                this._singleParent = null;
                _singleParent.remove(this);
            } else if (_parents = this._parents) {
                this._parents = null;
                for (var _i = 0, _parents_1 = _parents; _i < _parents_1.length; _i++) {
                    var parent_1 = _parents_1[_i];
                    parent_1.remove(this);
                }
            }
            var initialTeardown = this.initialTeardown;
            if (isFunction(initialTeardown)) try {
                initialTeardown();
            } catch (e) {
                errors = e instanceof UnsubscriptionError ? e.errors : [ e ];
            }
            var _teardowns = this._teardowns;
            this._teardowns = null;
            if (_teardowns) for (var _a = 0, _teardowns_1 = _teardowns; _a < _teardowns_1.length; _a++) {
                var teardown_1 = _teardowns_1[_a];
                try {
                    if ("function" === typeof teardown_1) teardown_1(); else teardown_1.unsubscribe();
                } catch (err) {
                    errors = null !== errors && void 0 !== errors ? errors : [];
                    if (err instanceof UnsubscriptionError) errors = __spreadArrays(errors, err.errors); else errors.push(err);
                }
            }
            if (errors) throw new UnsubscriptionError(errors);
        }
    };
    Subscription.prototype.add = function(teardown) {
        var _a;
        if (teardown && teardown !== this) if (this.closed) if ("function" === typeof teardown) teardown(); else teardown.unsubscribe(); else {
            if (teardown instanceof Subscription) {
                if (teardown.closed || teardown._hasParent(this)) return;
                teardown._addParent(this);
            }
            this._teardowns = null !== (_a = this._teardowns) && void 0 !== _a ? _a : [];
            this._teardowns.push(teardown);
        }
    };
    Subscription.prototype._hasParent = function(parent) {
        var _a;
        return this._singleParent === parent || (null === (_a = this._parents) || void 0 === _a ? void 0 : _a.includes(parent)) || false;
    };
    Subscription.prototype._addParent = function(parent) {
        var _singleParent = this._singleParent;
        var _parents;
        if (_singleParent) {
            this._parents = [ _singleParent, parent ];
            this._singleParent = null;
        } else if (_parents = this._parents) _parents.push(parent); else this._singleParent = parent;
    };
    Subscription.prototype._removeParent = function(parent) {
        var _singleParent = this._singleParent;
        var _parents;
        if (_singleParent) {
            if (_singleParent === parent) this._singleParent = null;
        } else if (_parents = this._parents) {
            var index = _parents.indexOf(parent);
            if (index >= 0) _parents.splice(index, 1);
        }
    };
    Subscription.prototype.remove = function(teardown) {
        var _teardowns = this._teardowns;
        if (_teardowns) {
            var index = _teardowns.indexOf(teardown);
            if (index >= 0) _teardowns.splice(index, 1);
        }
        if (teardown instanceof Subscription) teardown._removeParent(this);
    };
    Subscription.EMPTY = function(empty) {
        empty.closed = true;
        return empty;
    }(new Subscription());
    return Subscription;
}();

function isSubscription(value) {
    return value instanceof Subscription || value && "closed" in value && "function" === typeof value.remove && "function" === typeof value.add && "function" === typeof value.unsubscribe;
}

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
        if (!this.closed) {
            this.isStopped = true;
            _super.prototype.unsubscribe.call(this);
        }
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
    return Subscriber;
}(Subscription);

var SafeSubscriber = function(_super) {
    __extends(SafeSubscriber, _super);
    function SafeSubscriber(_parentSubscriber, observerOrNext, error, complete) {
        var _this = _super.call(this) || this;
        _this._parentSubscriber = _parentSubscriber;
        var next;
        if (isFunction(observerOrNext)) next = observerOrNext; else if (observerOrNext) {
            next = observerOrNext.next;
            error = observerOrNext.error;
            complete = observerOrNext.complete;
            if (observerOrNext !== empty) {
                var context_1;
                if (config.useDeprecatedNextContext) {
                    context_1 = Object.create(observerOrNext);
                    context_1.unsubscribe = _this.unsubscribe.bind(_this);
                } else context_1 = observerOrNext;
                next = next && next.bind(context_1);
                error = error && error.bind(context_1);
                complete = complete && complete.bind(context_1);
                if (isSubscription(observerOrNext)) observerOrNext.add(_this.unsubscribe.bind(_this));
            }
        }
        _this._next = next;
        _this._error = error;
        _this._complete = complete;
        return _this;
    }
    SafeSubscriber.prototype.next = function(value) {
        if (!this.isStopped && this._next) try {
            this._next(value);
        } catch (err) {
            this._throw(err);
        }
    };
    SafeSubscriber.prototype.error = function(err) {
        if (!this.isStopped) if (this._error) {
            try {
                this._error(err);
            } catch (err) {
                this._throw(err);
                return;
            }
            this.unsubscribe();
        } else this._throw(err);
    };
    SafeSubscriber.prototype._throw = function(err) {
        this.unsubscribe();
        if (config.useDeprecatedSynchronousErrorHandling) {
            var _parentSubscriber = this._parentSubscriber;
            if (null === _parentSubscriber || void 0 === _parentSubscriber ? void 0 : _parentSubscriber.syncErrorThrowable) {
                _parentSubscriber.syncErrorValue = err;
                _parentSubscriber.syncErrorThrown = true;
            } else throw err;
        } else hostReportError(err);
    };
    SafeSubscriber.prototype.complete = function() {
        if (!this.isStopped) {
            if (this._complete) try {
                this._complete();
            } catch (err) {
                this._throw(err);
                return;
            }
            this.unsubscribe();
        }
    };
    SafeSubscriber.prototype.unsubscribe = function() {
        if (!this.closed) {
            var _parentSubscriber = this._parentSubscriber;
            this._parentSubscriber = null;
            _parentSubscriber.unsubscribe();
            _super.prototype.unsubscribe.call(this);
        }
    };
    return SafeSubscriber;
}(Subscriber);

function toSubscriber(nextOrObserver, error, complete) {
    if (nextOrObserver) {
        if (isSubscriber(nextOrObserver)) return nextOrObserver;
        if (isObserver(nextOrObserver)) return new FullObserverSubscriber(nextOrObserver);
    }
    if (!nextOrObserver && !error && !complete) return new Subscriber(empty);
    return new Subscriber(nextOrObserver, error, complete);
}

function isObserver(value) {
    return value && "function" === typeof value.next && "function" === typeof value.error && "function" === typeof value.complete;
}

function isSubscriber(value) {
    return value instanceof Subscriber || isObserver(value) && isSubscription(value);
}

var FullObserverSubscriber = function(_super) {
    __extends(FullObserverSubscriber, _super);
    function FullObserverSubscriber(destination) {
        var _this = _super.call(this) || this;
        _this.destination = destination;
        return _this;
    }
    return FullObserverSubscriber;
}(Subscriber);

var observable = function() {
    return "function" === typeof Symbol && Symbol.observable || "@@observable";
}();

function identity(x) {
    return x;
}

function pipeFromArray(fns) {
    if (0 === fns.length) return identity;
    if (1 === fns.length) return fns[0];
    return function piped(input) {
        return fns.reduce(function(prev, fn) {
            return fn(prev);
        }, input);
    };
}

var Observable = function() {
    function Observable(subscribe) {
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
            } else if (canReportError(sink)) sink.error(err); else console.warn(err);
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

function canReportError(subscriber) {
    while (subscriber) {
        var _a = subscriber, closed_1 = _a.closed, destination = _a.destination, isStopped = _a.isStopped;
        if (closed_1 || isStopped) return false; else if (destination && destination instanceof Subscriber) subscriber = destination; else subscriber = null;
    }
    return true;
}

function isFormData(body) {
    return "undefined" !== typeof FormData && body instanceof FormData;
}

var AjaxObservable = function(_super_1) {
    __extends(AjaxObservable, _super_1);
    function AjaxObservable(urlOrRequest) {
        var _this = _super_1.call(this) || this;
        var request = {
            async: true,
            createXHR: function() {
                return new XMLHttpRequest();
            },
            crossDomain: true,
            withCredentials: false,
            headers: {},
            method: "GET",
            responseType: "json",
            timeout: 0
        };
        if ("string" === typeof urlOrRequest) request.url = urlOrRequest; else for (var prop in urlOrRequest) if (urlOrRequest.hasOwnProperty(prop)) request[prop] = urlOrRequest[prop];
        _this.request = request;
        return _this;
    }
    AjaxObservable.prototype._subscribe = function(subscriber) {
        return new AjaxSubscriber(subscriber, this.request);
    };
    return AjaxObservable;
}(Observable);

var AjaxSubscriber = function(_super_1) {
    __extends(AjaxSubscriber, _super_1);
    function AjaxSubscriber(destination, request) {
        var _this = _super_1.call(this, destination) || this;
        _this.request = request;
        _this.done = false;
        var headers = request.headers = request.headers || {};
        if (!request.crossDomain && !_this.getHeader(headers, "X-Requested-With")) headers["X-Requested-With"] = "XMLHttpRequest";
        var contentTypeHeader = _this.getHeader(headers, "Content-Type");
        if (!contentTypeHeader && "undefined" !== typeof request.body && !isFormData(request.body)) headers["Content-Type"] = "application/x-www-form-urlencoded; charset=UTF-8";
        request.body = _this.serializeBody(request.body, _this.getHeader(request.headers, "Content-Type"));
        _this.send();
        return _this;
    }
    AjaxSubscriber.prototype.next = function(e) {
        this.done = true;
        var destination = this.destination;
        var result;
        try {
            result = new AjaxResponse(e, this.xhr, this.request);
        } catch (err) {
            return destination.error(err);
        }
        destination.next(result);
    };
    AjaxSubscriber.prototype.send = function() {
        var _a = this, request = _a.request, _b = _a.request, user = _b.user, method = _b.method, url = _b.url, async = _b.async, password = _b.password, headers = _b.headers, body = _b.body;
        try {
            var xhr = this.xhr = request.createXHR();
            this.setupEvents(xhr, request);
            if (user) xhr.open(method, url, async, user, password); else xhr.open(method, url, async);
            if (async) {
                xhr.timeout = request.timeout;
                xhr.responseType = request.responseType;
            }
            if ("withCredentials" in xhr) xhr.withCredentials = !!request.withCredentials;
            this.setHeaders(xhr, headers);
            if (body) xhr.send(body); else xhr.send();
        } catch (err) {
            this.error(err);
        }
    };
    AjaxSubscriber.prototype.serializeBody = function(body, contentType) {
        if (!body || "string" === typeof body) return body; else if (isFormData(body)) return body;
        if (contentType) {
            var splitIndex = contentType.indexOf(";");
            if (-1 !== splitIndex) contentType = contentType.substring(0, splitIndex);
        }
        switch (contentType) {
          case "application/x-www-form-urlencoded":
            return Object.keys(body).map(function(key) {
                return encodeURIComponent(key) + "=" + encodeURIComponent(body[key]);
            }).join("&");

          case "application/json":
            return JSON.stringify(body);

          default:
            return body;
        }
    };
    AjaxSubscriber.prototype.setHeaders = function(xhr, headers) {
        for (var key in headers) if (headers.hasOwnProperty(key)) xhr.setRequestHeader(key, headers[key]);
    };
    AjaxSubscriber.prototype.getHeader = function(headers, headerName) {
        for (var key in headers) if (key.toLowerCase() === headerName.toLowerCase()) return headers[key];
        return;
    };
    AjaxSubscriber.prototype.setupEvents = function(xhr, request) {
        var _this = this;
        var progressSubscriber = request.progressSubscriber;
        xhr.ontimeout = function(e) {
            var _a;
            null === (_a = null === progressSubscriber || void 0 === progressSubscriber ? void 0 : progressSubscriber.error) || void 0 === _a ? void 0 : _a.call(progressSubscriber, e);
            var error;
            try {
                error = new AjaxTimeoutError(xhr, request);
            } catch (err) {
                error = err;
            }
            _this.error(error);
        };
        if (progressSubscriber) xhr.upload.onprogress = function(e) {
            var _a;
            null === (_a = progressSubscriber.next) || void 0 === _a ? void 0 : _a.call(progressSubscriber, e);
        };
        xhr.onerror = function(e) {
            var _a;
            null === (_a = null === progressSubscriber || void 0 === progressSubscriber ? void 0 : progressSubscriber.error) || void 0 === _a ? void 0 : _a.call(progressSubscriber, e);
            _this.error(new AjaxError("ajax error", xhr, request));
        };
        xhr.onload = function(e) {
            var _a, _b;
            if (xhr.status < 400) {
                null === (_a = null === progressSubscriber || void 0 === progressSubscriber ? void 0 : progressSubscriber.complete) || void 0 === _a ? void 0 : _a.call(progressSubscriber);
                _this.next(e);
                _this.complete();
            } else {
                null === (_b = null === progressSubscriber || void 0 === progressSubscriber ? void 0 : progressSubscriber.error) || void 0 === _b ? void 0 : _b.call(progressSubscriber, e);
                var error = void 0;
                try {
                    error = new AjaxError("ajax error " + xhr.status, xhr, request);
                } catch (err) {
                    error = err;
                }
                _this.error(error);
            }
        };
    };
    AjaxSubscriber.prototype.unsubscribe = function() {
        var _a = this, done = _a.done, xhr = _a.xhr;
        if (!done && xhr && 4 !== xhr.readyState && "function" === typeof xhr.abort) xhr.abort();
        _super_1.prototype.unsubscribe.call(this);
    };
    return AjaxSubscriber;
}(Subscriber);

var AjaxResponse = function() {
    function AjaxResponse(originalEvent, xhr, request) {
        this.originalEvent = originalEvent;
        this.xhr = xhr;
        this.request = request;
        this.status = xhr.status;
        this.responseType = xhr.responseType || request.responseType;
        this.response = getXHRResponse(xhr);
    }
    return AjaxResponse;
}();

var AjaxError = createErrorClass(function(_super) {
    return function AjaxError(message, xhr, request) {
        _super(this);
        this.message = message;
        this.xhr = xhr;
        this.request = request;
        this.status = xhr.status;
        this.responseType = xhr.responseType;
        var response;
        try {
            response = getXHRResponse(xhr);
        } catch (err) {
            response = xhr.responseText;
        }
        this.response = response;
        return this;
    };
});

function getXHRResponse(xhr) {
    switch (xhr.responseType) {
      case "json":
        if ("response" in xhr) return xhr.response; else {
            var ieXHR = xhr;
            return JSON.parse(ieXHR.responseText);
        }

      case "document":
        return xhr.responseXML;

      case "text":
      default:
        if ("response" in xhr) return xhr.response; else {
            var ieXHR = xhr;
            return ieXHR.responseText;
        }
    }
}

var AjaxTimeoutErrorImpl = function() {
    function AjaxTimeoutErrorImpl(xhr, request) {
        AjaxError.call(this, "ajax timeout", xhr, request);
        this.name = "AjaxTimeoutError";
        return this;
    }
    AjaxTimeoutErrorImpl.prototype = Object.create(AjaxError.prototype);
    return AjaxTimeoutErrorImpl;
}();

var AjaxTimeoutError = AjaxTimeoutErrorImpl;
