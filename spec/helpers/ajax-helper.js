var root = require('../../dist/cjs/util/root').root;

var requests = [];
var recentRequest = null;

function MockXMLHttpRequest() {
  this.previousRequest = recentRequest;
  recentRequest = this;
  requests.push(this);
  this.requestHeaders = {};
  this.responseType = '';
  this.eventHandlers = [];
  this.readyState = 0;
}

MockXMLHttpRequest.prototype = {
  send: function (data) {
    this.data = data;
  },

  open: function (method, url, async, user, password) {
    this.method = method;
    this.url = url;
    this.async = async;
    this.user = user;
    this.password = password;
    this.readyState = 1;
    this.triggerEvent('readystatechange');
  },

  setRequestHeader: function (key, value) {
    this.requestHeaders[key] = value;
  },

  addEventListener: function (name, handler) {
    this.eventHandlers.push({ name: name, handler: handler });
  },

  removeEventListener: function (name, handler) {
    for (var i = this.eventHandlers.length - 1; i--;) {
      var eh = this.eventHandlers[i];
      if (eh.name === name && eh.handler === handler) {
        this.eventHandlers.splice(i, 1);
      }
    }
  },

  throwError: function (err) {
    // TODO: something better with errors
    this.triggerEvent('error');
  },

  respondWith: function (response) {
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
        } catch (err) {
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
  },

  triggerEvent: function (name, eventObj) {
    // TODO: create a better default event
    e = eventObj || {};

    if (this['on' + name]) {
      this['on' + name](e);
    }

    this.eventHandlers.forEach(function (eh) {
      if (eh.name === name) {
        eh.handler.call(this, e);
      }
    });
  }
};

MockXMLHttpRequest.mostRecent = function () {
  return recentRequest;
};

MockXMLHttpRequest.allRequests = function () {
  return requests;
};

var gXHR;
var rXHR;

global.setupMockXHR = function () {
  gXHR = global.XMLHttpRequest;
  rXHR = root.XMLHttpRequest;
  global.XMLHttpRequest = MockXMLHttpRequest;
  root.XMLHttpRequest = MockXMLHttpRequest;
};

global.teardownMockXHR = function () {
  global.XMLHttpRequest = gXHR;
  root.XMLHttpRequest = rXHR;
  requests.length = 0;
  recentRequest = null;
};