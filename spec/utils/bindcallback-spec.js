/* globals describe, it, expect */
var Rx = require('../../dist/cjs/Rx');
var bindCallback = require('../../dist/cjs/util/bindCallback').bindCallback;

describe('bindCallback', function () {
  it('should bind function has no parameter', function () {
    var invoked = false;

    function callback() {
      invoked = true;
    }

    var bind = bindCallback(callback, null, 0);
    bind();

    expect(bind).not.toBe(callback);
    expect(invoked).toBe(true);
  });

  it('should bind function has no parameter with thisArg', function () {
    var invoked = false;
    var thisArg = { context: true };

    function callback() {
      invoked = true;
      expect(this.context).toBe(true);
    }

    var bind = bindCallback(callback, thisArg, 0);
    bind();

    expect(bind).not.toBe(callback);
    expect(invoked).toBe(true);
  });

  it('should bind function has value parameter', function () {
    var expected = 'expected';

    function callback(value) {
      expect(value).toBe(expected);
    }

    var bind = bindCallback(callback, null, 1);

    bind(expected);
    expect(bind).not.toBe(callback);
  });

  it('should bind function has value parameter with thisArg', function () {
    var expected = 'expected';
    var thisArg = { context: true };

    function callback(value) {
      expect(value).toBe(expected);
      expect(this.context).toBe(true);
    }

    var bind = bindCallback(callback, thisArg, 1);
    bind(expected);

    expect(bind).not.toBe(callback);
  });

  it('should bind function has value and index parameter', function () {
    var expected = 'expected';
    var expectedIndex = 42;

    function callback(value, index) {
      expect(value).toBe(expected);
      expect(index).toBe(expectedIndex);
    }

    var bind = bindCallback(callback, null, 2);
    bind(expected, expectedIndex);

    expect(bind).not.toBe(callback);
  });

  it('should bind function has value and index parameter with thisArg', function () {
    var expected = 'expected';
    var expectedIndex = 42;
    var thisArg = { context: true };

    function callback(value, index) {
      expect(value).toBe(expected);
      expect(index).toBe(expectedIndex);
      expect(this.context).toBe(true);
    }

    var bind = bindCallback(callback, thisArg, 2);
    bind(expected, expectedIndex);

    expect(bind).not.toBe(callback);
  });

  it('should bind function has value and index, source parameter', function () {
    var expected = 'expected';
    var expectedIndex = 42;
    var expectedSource = Rx.Observable.of('1','2','3');

    function callback(value, index, source) {
      expect(value).toBe(expected);
      expect(index).toBe(expectedIndex);
      expect(source).toBe(expectedSource);
    }

    var bind = bindCallback(callback, null, 3);
    bind(expected, expectedIndex, expectedSource);

    expect(bind).not.toBe(callback);
  });

  it('should bind function has value and index, source parameter with thisArg', function () {
    var expected = 'expected';
    var expectedIndex = 42;
    var expectedSource = Rx.Observable.of('1','2','3');
    var thisArg = { context: true };

    function callback(value, index, source) {
      expect(value).toBe(expected);
      expect(index).toBe(expectedIndex);
      expect(source).toBe(expectedSource);
      expect(this.context).toBe(true);
    }

    var bind = bindCallback(callback, thisArg, 3);
    bind(expected, expectedIndex, expectedSource);

    expect(bind).not.toBe(callback);
  });

  it('should try to apply function for unexpected parameter', function () {
    var expected = 'expected';

    function callback(value) {
      expect(value).toBe(expected);
    }

    var bind = bindCallback(callback, null);
    bind(expected);

    expect(bind).not.toBe(callback);
  });

  it('should try to apply function for unexpected parameter with thisArg', function () {
    var expected = 'expected';
    var thisArg = { context: true };

    function callback(value) {
      expect(value).toBe(expected);
      expect(this.context).toBe(true);
    }

    var bind = bindCallback(callback, thisArg);
    bind(expected);

    expect(bind).not.toBe(callback);
  });

  it('should return function directly if thisArg undefined', function () {
    function callback() {
    }

    var bind = bindCallback(callback, undefined);
    expect(bind).toBe(callback);
  });

  it('should return function directly if thisArg undefined with argCount', function () {
    function callback() {
    }

    var bind = bindCallback(callback, undefined, 2);
    expect(bind).toBe(callback);
  });
});