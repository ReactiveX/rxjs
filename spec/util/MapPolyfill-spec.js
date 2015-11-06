var MapPolyfill = require('../../dist/cjs/util/MapPolyfill').MapPolyfill;

describe('MapPolyfill', function () {
  it('should exist', function () {
    expect(typeof MapPolyfill).toBe('function');
  });

  it('should act like a hashtable that accepts objects as keys', function () {
    var map = new MapPolyfill();
    var key1 = {};
    var key2 = {};

    map.set('test', 'hi');
    map.set(key1, 'yo');
    map.set(key2, 'what up');

    expect(map.get('test')).toBe('hi');
    expect(map.get(key1)).toBe('yo');
    expect(map.get(key2)).toBe('what up');
    expect(map.size).toBe(3);
  });

  it('should allow setting keys twice', function () {
    var map = new MapPolyfill();
    var key1 = {};

    map.set(key1, 'sing');
    map.set(key1, 'yodel');

    expect(map.get(key1)).toBe('yodel');
    expect(map.size).toBe(1);
  });

  it('should have a delete method that removes keys', function () {
    var map = new MapPolyfill();
    var key1 = {};

    map.set(key1, 'sing');
    expect(map.size).toBe(1);

    map.delete(key1);

    expect(map.size).toBe(0);
    expect(map.get(key1)).toBe(undefined);
  });

  describe('prototype.forEach', function () {
    it('should exist', function () {
      var map = new MapPolyfill();
      expect(typeof map.forEach).toBe('function');
    });

    it('should iterate over keys and values', function () {
      var expectedKeys = ['a', 'b', 'c'];
      var expectedValues = [1, 2, 3];
      var map = new MapPolyfill();
      map.set('a', 1);
      map.set('b', 2);
      map.set('c', 3);
      var thisArg = {};

      map.forEach(function (value, key) {
        expect(this).toBe(thisArg);
        expect(value).toBe(expectedValues.shift());
        expect(key).toBe(expectedKeys.shift());
      }, thisArg);

      expect(expectedValues.length).toBe(0);
      expect(expectedKeys.length).toBe(0);
    });
  });
});