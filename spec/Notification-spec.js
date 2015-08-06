/* globals describe, it, expect */
var Rx = require('../dist/cjs/Rx');

var Notification = Rx.Notification;

describe('Notification', function () {
  it('should exist', function () {
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
});