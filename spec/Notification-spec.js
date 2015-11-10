/* globals describe, it, expect, expectObservable */
var Rx = require('../dist/cjs/Rx');

var Notification = Rx.Notification;

describe('Notification', function () {
  it('should exist', function () {
    expect(Notification).toBeDefined();
    expect(typeof Notification).toBe('function');
  });

  describe('createNext', function () {
    it('should return a Notification', function () {
      var n = Notification.createNext('test');
      expect(n instanceof Notification).toBe(true);
      expect(n.value).toBe('test');
      expect(n.kind).toBe('N');
      expect(typeof n.exception).toBe('undefined');
      expect(n.hasValue).toBe(true);
    });
  });

  describe('createError', function () {
    it('should return a Notification', function () {
      var n = Notification.createError('test');
      expect(n instanceof Notification).toBe(true);
      expect(typeof n.value).toBe('undefined');
      expect(n.kind).toBe('E');
      expect(n.exception).toBe('test');
      expect(n.hasValue).toBe(false);
    });
  });

  describe('createComplete', function () {
    it('should return a Notification', function () {
      var n = Notification.createComplete();
      expect(n instanceof Notification).toBe(true);
      expect(typeof n.value).toBe('undefined');
      expect(n.kind).toBe('C');
      expect(typeof n.exception).toBe('undefined');
      expect(n.hasValue).toBe(false);
    });
  });

  describe('toObservable', function () {
    it('should create observable from a next Notification', function () {
      var value = 'a';
      var next = Notification.createNext(value);
      expectObservable(next.toObservable()).toBe('(a|)');
    });

    it('should create observable from a complete Notification', function () {
      var complete = Notification.createComplete();
      expectObservable(complete.toObservable()).toBe('|');
    });

    it('should create observable from a error Notification', function () {
      var error = Notification.createError('error');
      expectObservable(error.toObservable()).toBe('#');
    });
  });

  describe('static reference', function () {
    it('should create new next Notification with value', function () {
      var value = 'a';
      var first = Notification.createNext(value);
      var second = Notification.createNext(value);

      expect(first).not.toBe(second);
    });

    it('should create new error Notification', function () {
      var first = Notification.createError();
      var second = Notification.createError();

      expect(first).not.toBe(second);
    });

    it('should return static next Notification reference without value', function () {
      var first = Notification.createNext(undefined);
      var second = Notification.createNext(undefined);

      expect(first).toBe(second);
    });

    it('should return static complete Notification reference', function () {
      var first = Notification.createComplete();
      var second = Notification.createComplete();

      expect(first).toBe(second);
    });
  });

  describe('do', function () {
    it('should invoke on next', function () {
      var n = Notification.createNext('a');
      var invoked = false;
      n.do(function (x) {
        invoked = true;
      }, function (x) {
        throw 'should not be called';
      }, function () {
        throw 'should not be called';
      });

      expect(invoked).toBe(true);
    });

    it('should invoke on error', function () {
      var n = Notification.createError();
      var invoked = false;
      n.do(function (x) {
        throw 'should not be called';
      }, function (x) {
        invoked = true;
      }, function () {
        throw 'should not be called';
      });

      expect(invoked).toBe(true);
    });

    it('should invoke on complete', function () {
      var n = Notification.createComplete();
      var invoked = false;
      n.do(function (x) {
        throw 'should not be called';
      }, function (x) {
        throw 'should not be called';
      }, function () {
        invoked = true;
      });

      expect(invoked).toBe(true);
    });
  });

  describe('accept', function () {
    it('should accept observer for next Notification', function () {
      var value = 'a';
      var observed = false;
      var n = Notification.createNext(value);
      var observer = Rx.Subscriber.create(function (x) {
        expect(x).toBe(value);
        observed = true;
      }, function (x) {
        throw 'should not be called';
      }, function () {
        throw 'should not be called';
      });

      n.accept(observer);
      expect(observed).toBe(true);
    });

    it('should accept observer for error Notification', function () {
      var observed = false;
      var n = Notification.createError();
      var observer = Rx.Subscriber.create(function (x) {
        throw 'should not be called';
      }, function (x) {
        observed = true;
      }, function () {
        throw 'should not be called';
      });

      n.accept(observer);
      expect(observed).toBe(true);
    });

    it('should accept observer for complete Notification', function () {
      var observed = false;
      var n = Notification.createComplete();
      var observer = Rx.Subscriber.create(function (x) {
        throw 'should not be called';
      }, function (x) {
        throw 'should not be called';
      }, function () {
        observed = true;
      });

      n.accept(observer);
      expect(observed).toBe(true);
    });

    it('should accept function for next Notification', function () {
      var value = 'a';
      var observed = false;
      var n = Notification.createNext(value);

      n.accept(function (x) {
        expect(x).toBe(value);
        observed = true;
      }, function (x) {
        throw 'should not be called';
      }, function () {
        throw 'should not be called';
      });
      expect(observed).toBe(true);
    });

    it('should accept function for error Notification', function () {
      var observed = false;
      var error = 'error';
      var n = Notification.createError(error);

      n.accept(function (x) {
        throw 'should not be called';
      }, function (x) {
        expect(x).toBe(error);
        observed = true;
      }, function () {
        throw 'should not be called';
      });
      expect(observed).toBe(true);
    });

    it('should accept function for complete Notification', function () {
      var observed = false;
      var n = Notification.createComplete();

      n.accept(function (x) {
        throw 'should not be called';
      }, function (x) {
        throw 'should not be called';
      }, function () {
        observed = true;
      });
      expect(observed).toBe(true);
    });
  });

  describe('observe', function () {
    it('should observe for next Notification', function () {
      var value = 'a';
      var observed = false;
      var n = Notification.createNext(value);
      var observer = Rx.Subscriber.create(function (x) {
        expect(x).toBe(value);
        observed = true;
      }, function (x) {
        throw 'should not be called';
      }, function () {
        throw 'should not be called';
      });

      n.observe(observer);
      expect(observed).toBe(true);
    });

    it('should observe for error Notification', function () {
      var observed = false;
      var n = Notification.createError();
      var observer = Rx.Subscriber.create(function (x) {
        throw 'should not be called';
      }, function (x) {
        observed = true;
      }, function () {
        throw 'should not be called';
      });

      n.observe(observer);
      expect(observed).toBe(true);
    });

    it('should observe for complete Notification', function () {
      var observed = false;
      var n = Notification.createComplete();
      var observer = Rx.Subscriber.create(function (x) {
        throw 'should not be called';
      }, function (x) {
        throw 'should not be called';
      }, function () {
        observed = true;
      });

      n.observe(observer);
      expect(observed).toBe(true);
    });
  });
});
