"use strict";
var MockWebSocket = (function () {
    function MockWebSocket(url, protocol) {
        this.url = url;
        this.protocol = protocol;
        this.sent = [];
        this.handlers = {};
        this.readyState = 0;
        MockWebSocket.sockets.push(this);
    }
    Object.defineProperty(MockWebSocket, "lastSocket", {
        get: function () {
            var socket = MockWebSocket.sockets;
            var length = socket.length;
            return length > 0 ? socket[length - 1] : undefined;
        },
        enumerable: true,
        configurable: true
    });
    MockWebSocket.clearSockets = function () {
        MockWebSocket.sockets.length = 0;
    };
    MockWebSocket.prototype.send = function (data) {
        this.sent.push(data);
    };
    Object.defineProperty(MockWebSocket.prototype, "lastMessageSent", {
        get: function () {
            var sent = this.sent;
            var length = sent.length;
            return length > 0 ? sent[length - 1] : undefined;
        },
        enumerable: true,
        configurable: true
    });
    MockWebSocket.prototype.triggerClose = function (e) {
        this.readyState = 3;
        this.trigger('close', e);
    };
    MockWebSocket.prototype.triggerError = function (err) {
        this.readyState = 3;
        this.trigger('error', err);
    };
    MockWebSocket.prototype.triggerMessage = function (data) {
        var messageEvent = {
            data: data,
            origin: 'mockorigin',
            ports: undefined,
            source: __root__,
        };
        this.trigger('message', messageEvent);
    };
    MockWebSocket.prototype.open = function () {
        this.readyState = 1;
        this.trigger('open', {});
    };
    MockWebSocket.prototype.close = function (code, reason) {
        if (this.readyState < 2) {
            this.readyState = 2;
            this.closeCode = code;
            this.closeReason = reason;
            this.triggerClose({ wasClean: true });
        }
    };
    MockWebSocket.prototype.addEventListener = function (name, handler) {
        var lookup = this.handlers[name] = this.handlers[name] || [];
        lookup.push(handler);
    };
    MockWebSocket.prototype.removeEventListener = function (name, handler) {
        var lookup = this.handlers[name];
        if (lookup) {
            for (var i = lookup.length - 1; i--;) {
                if (lookup[i] === handler) {
                    lookup.splice(i, 1);
                }
            }
        }
    };
    MockWebSocket.prototype.trigger = function (name, e) {
        if (this['on' + name]) {
            this['on' + name](e);
        }
        var lookup = this.handlers[name];
        if (lookup) {
            for (var i = 0; i < lookup.length; i++) {
                lookup[i](e);
            }
        }
    };
    MockWebSocket.sockets = [];
    return MockWebSocket;
}());
exports.MockWebSocket = MockWebSocket;
var MockXMLHttpRequest = (function () {
    function MockXMLHttpRequest() {
        this.responseType = '';
        this.eventHandlers = [];
        this.readyState = 0;
        this.requestHeaders = {};
        this.previousRequest = MockXMLHttpRequest.recentRequest;
        MockXMLHttpRequest.recentRequest = this;
        MockXMLHttpRequest.requests.push(this);
    }
    Object.defineProperty(MockXMLHttpRequest, "mostRecent", {
        get: function () {
            return MockXMLHttpRequest.recentRequest;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MockXMLHttpRequest, "allRequests", {
        get: function () {
            return MockXMLHttpRequest.requests;
        },
        enumerable: true,
        configurable: true
    });
    MockXMLHttpRequest.clearRequest = function () {
        MockXMLHttpRequest.requests.length = 0;
        MockXMLHttpRequest.recentRequest = null;
    };
    MockXMLHttpRequest.prototype.send = function (data) {
        this.data = data;
    };
    MockXMLHttpRequest.prototype.open = function (method, url, async, user, password) {
        this.method = method;
        this.url = url;
        this.user = user;
        this.password = password;
        this.readyState = 1;
        this.triggerEvent('readyStateChange');
    };
    MockXMLHttpRequest.prototype.setRequestHeader = function (key, value) {
        this.requestHeaders[key] = value;
    };
    MockXMLHttpRequest.prototype.addEventListener = function (name, handler) {
        this.eventHandlers.push({ name: name, handler: handler });
    };
    MockXMLHttpRequest.prototype.removeEventListener = function (name, handler) {
        for (var i = this.eventHandlers.length - 1; i--;) {
            var eh = this.eventHandlers[i];
            if (eh.name === name && eh.handler === handler) {
                this.eventHandlers.splice(i, 1);
            }
        }
    };
    MockXMLHttpRequest.prototype.throwError = function (err) {
        // TODO: something better with errors
        this.triggerEvent('error');
    };
    MockXMLHttpRequest.prototype.respondWith = function (response) {
        this.readyState = 4;
        this.responseHeaders = {
            'Content-Type': response.contentType || 'text/plain'
        };
        this.status = response.status || 200;
        this.responseText = response.responseText;
        if (!('response' in response)) {
            switch (this.responseType) {
                case 'json':
                    try {
                        this.response = JSON.parse(response.responseText);
                    }
                    catch (err) {
                        throw new Error('unable to JSON.parse: \n' + response.responseText);
                    }
                    break;
                case 'text':
                    this.response = response.responseText;
                    break;
                default:
                    throw new Error('unhandled type "' + this.responseType + '"');
            }
        }
        // TODO: pass better event to onload.
        this.triggerEvent('load');
        this.triggerEvent('readystatechange');
    };
    MockXMLHttpRequest.prototype.triggerEvent = function (name, eventObj) {
        // TODO: create a better default event
        var e = eventObj || {};
        if (this['on' + name]) {
            this['on' + name](e);
        }
        this.eventHandlers.forEach(function (eh) {
            if (eh.name === name) {
                eh.handler.call(this, e);
            }
        });
    };
    MockXMLHttpRequest.requests = [];
    return MockXMLHttpRequest;
}());
exports.MockXMLHttpRequest = MockXMLHttpRequest;
//# sourceMappingURL=ajax-helper.js.map