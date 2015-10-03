/* globals describe, it, expect */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.fromEvent', function () {
  it('should setup an event observable on objects with "on" and "off" ', function () {
    var onEventName;
    var onHandler;
    var offEventName;
    var offHandler;
    var obj = {
      on: function (a, b) {
        onEventName = a;
        onHandler = b;
      },
      off: function (a, b) {
        offEventName = a;
        offHandler = b;
      }
    };

    var subscription = Observable.fromEvent(obj, 'click')
      .subscribe(function () { });

    subscription.unsubscribe();

    expect(onEventName).toBe('click');
    expect(typeof onHandler).toBe('function');
    expect(offEventName).toBe(onEventName);
    expect(offHandler).toBe(onHandler);
  });

  it('should setup an event observable on objects with "addEventListener" and "removeEventListener" ', function () {
    var onEventName;
    var onHandler;
    var offEventName;
    var offHandler;
    var obj = {
      addEventListener: function (a, b) {
        onEventName = a;
        onHandler = b;
      },
      removeEventListener: function (a, b) {
        offEventName = a;
        offHandler = b;
      }
    };

    var subscription = Observable.fromEvent(obj, 'click')
      .subscribe(function () { });

    subscription.unsubscribe();

    expect(onEventName).toBe('click');
    expect(typeof onHandler).toBe('function');
    expect(offEventName).toBe(onEventName);
    expect(offHandler).toBe(onHandler);
  });

  it('should setup an event observable on objects with "addListener" and "removeListener" ', function () {
    var onEventName;
    var onHandler;
    var offEventName;
    var offHandler;
    var obj = {
      addListener: function (a, b) {
        onEventName = a;
        onHandler = b;
      },
      removeListener: function (a, b) {
        offEventName = a;
        offHandler = b;
      }
    };

    var subscription = Observable.fromEvent(obj, 'click')
      .subscribe(function () { });

    subscription.unsubscribe();

    expect(onEventName).toBe('click');
    expect(typeof onHandler).toBe('function');
    expect(offEventName).toBe(onEventName);
    expect(offHandler).toBe(onHandler);
  });

  it('should pass through events that occur', function (done) {
    var send;
    var obj = {
      on: function (name, handler) {
        send = handler;
      },
      off: function () {
      }
    };

    var subscription = Observable.fromEvent(obj, 'click')
      .subscribe(function (e) {
        expect(e).toBe('test');
        done();
      });

    send('test');
  });

  it('should pass through events that occur and use the selector if provided', function (done) {
    var send;
    var obj = {
      on: function (name, handler) {
        send = handler;
      },
      off: function () {
      }
    };

    function selector(x) {
      return x + '!';
    }

    var subscription = Observable.fromEvent(obj, 'click', selector)
      .subscribe(function (e) {
        expect(e).toBe('test!');
        done();
      });

    send('test');
  });
});