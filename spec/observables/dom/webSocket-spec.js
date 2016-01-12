/* globals describe, it, expect, sinon, rxTestScheduler */
var Rx = require('../../../dist/cjs/Rx.DOM');
var Observable = Rx.Observable;

function noop() {
  // nope.
}

describe('Observable.webSocket', function () {
  beforeEach(function () {
    setupMockWebSocket();
  });

  afterEach(function () {
    teardownMockWebSocket();
  });

  it('should send and receive messages', function () {
    var messageReceived = false;
    var subject = Observable.webSocket('ws://mysocket');

    subject.next('ping');

    subject.subscribe(function (x) {
      expect(x).toBe('pong');
      messageReceived = true;
    });

    var socket = MockWebSocket.lastSocket();
    expect(socket.url).toBe('ws://mysocket');

    socket.open();
    expect(socket.lastMessageSent()).toBe('ping');

    socket.triggerMessage('pong');
    expect(messageReceived).toBe(true);
  });

  it('receive multiple messages', function () {
    var expected = ['what', 'do', 'you', 'do', 'with', 'a', 'drunken', 'sailor?'];
    var results = [];
    var subject = Observable.webSocket('ws://mysocket');

    subject.subscribe(function (x) {
      results.push(x);
    });

    var socket = MockWebSocket.lastSocket();

    socket.open();

    expected.forEach(function (x) {
      socket.triggerMessage(x);
    });

    expect(results).toEqual(expected);
  });

  it('should queue messages prior to subscription', function () {
    var expected = ['make', 'him', 'walk', 'the', 'plank'];
    var subject = Observable.webSocket('ws://mysocket');

    expected.forEach(function (x) {
      subject.next(x);
    });

    var socket = MockWebSocket.lastSocket();
    expect(socket).not.toBeDefined();

    subject.subscribe();

    socket = MockWebSocket.lastSocket();
    expect(socket.sent.length).toBe(0);

    socket.open();
    expect(socket.sent.length).toBe(expected.length);
  });

  it('should send messages immediately if already open', function () {
    var subject = Observable.webSocket('ws://mysocket');
    subject.subscribe();
    var socket = MockWebSocket.lastSocket();
    socket.open();

    subject.next('avast!');
    expect(socket.lastMessageSent()).toBe('avast!');
    subject.next('ye swab!');
    expect(socket.lastMessageSent()).toBe('ye swab!');
  });

  it('should close the socket when completed', function () {
    var subject = Observable.webSocket('ws://mysocket');
    subject.subscribe();
    var socket = MockWebSocket.lastSocket();
    socket.open();

    expect(socket.readyState).toBe(1); // open

    spyOn(socket, 'close').and.callThrough();
    expect(socket.close).not.toHaveBeenCalled();

    subject.complete();
    expect(socket.close).toHaveBeenCalled();
    expect(socket.readyState).toBe(3); // closed
  });

  it('should close the socket with a code and a reason when errored', function () {
    var subject = Observable.webSocket('ws://mysocket');
    subject.subscribe();
    var socket = MockWebSocket.lastSocket();
    socket.open();

    spyOn(socket, 'close').and.callThrough();
    expect(socket.close).not.toHaveBeenCalled();

    subject.error({ code: 1337, reason: 'Too bad, so sad :('});
    expect(socket.close).toHaveBeenCalledWith(1337, 'Too bad, so sad :(');
  });

  it('should allow resubscription after closure via complete', function () {
    var subject = Observable.webSocket('ws://mysocket');
    subject.subscribe();
    var socket1 = MockWebSocket.lastSocket();
    socket1.open();
    subject.complete();

    subject.next('a mariner yer not. yarrr.');
    subject.subscribe();
    var socket2 = MockWebSocket.lastSocket();
    socket2.open();

    expect(socket2).not.toBe(socket1);
    expect(socket2.lastMessageSent()).toBe('a mariner yer not. yarrr.');
  });

  it('should allow resubscription after closure via error', function () {
    var subject = Observable.webSocket('ws://mysocket');
    subject.subscribe();
    var socket1 = MockWebSocket.lastSocket();
    socket1.open();
    subject.error({ code: 1337 });

    subject.next('yo-ho! yo-ho!');
    subject.subscribe();
    var socket2 = MockWebSocket.lastSocket();
    socket2.open();

    expect(socket2).not.toBe(socket1);
    expect(socket2.lastMessageSent()).toBe('yo-ho! yo-ho!');
  });
});

var sockets = [];

function MockWebSocket(url, protocol) {
  sockets.push(this);
  this.url = url;
  this.protocol = protocol;
  this.sent = [];
  this.handlers = {};
  this.readyState = 0;
}

MockWebSocket.lastSocket = function () {
  return sockets.length > 0 ? sockets[sockets.length - 1] : undefined;
};

MockWebSocket.prototype = {
  send: function (data) {
    this.sent.push(data);
  },

  lastMessageSent: function () {
    var sent = this.sent;
    return sent.length > 0 ? sent[sent.length - 1] : undefined;
  },

  closeDirty: function (code, reason) {
    if (this.readyState < 2) {
      this.readyState = 2;
      this.closeCode = code;
      this.closeReason = reason;
      this.triggerClose({ wasClean: false });
    }
  },

  triggerClose: function (e) {
    this.readyState = 3;
    this.trigger('close', e);
  },

  triggerError: function (err) {
    this.readyState = 3;
    this.trigger('error', err);
  },

  triggerMessage: function (data) {
    var messageEvent = {
      data: JSON.stringify(data),
      origin: 'mockorigin',
      ports: undefined,
      source: __root__,
    };

    this.trigger('message', messageEvent);
  },

  open: function () {
    this.readyState = 1;
    this.trigger('open', {});
  },

  close: function (code, reason) {
    if (this.readyState < 2) {
      this.readyState = 2;
      this.closeCode = code;
      this.closeReason = reason;
      this.triggerClose({ wasClean: true });
    }
  },

  addEventListener: function (name, handler) {
    var lookup = this.handlers[name] = this.handlers[name] || [];
    lookup.push(handler);
  },

  removeEventListener: function (name, handler) {
    var lookup = this.handlers[name];
    if (lookup) {
      for (var i = lookup.length - 1; i--;) {
        if (lookup[i] === handler) {
          lookup.splice(i, 1);
        }
      }
    }
  },

  trigger: function (name, e) {
    if (this['on' + name]) {
      this['on' + name](e);
    }

    var lookup = this.handlers[name];
    if (lookup) {
      for (var i = 0; i < lookup.length; i++) {
        lookup[i](e);
      }
    }
  }
}

var __ws;
function setupMockWebSocket() {
  sockets = [];
  __ws = __root__.WebSocket;
  __root__.WebSocket = MockWebSocket;
}

function teardownMockWebSocket() {
  __root__.WebSocket = __ws;
  sockets = null;
}