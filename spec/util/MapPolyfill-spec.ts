import { expect } from 'chai';
import { MapPolyfill } from '../../dist/package/util/MapPolyfill';

/** @test {MapPolyfill} */
describe('MapPolyfill', () => {
  it('should exist', () => {
    expect(MapPolyfill).to.be.a('function');
  });

  it('should act like a hashtable that accepts objects as keys', () => {
    const map = new MapPolyfill();
    const key1 = {};
    const key2 = {};

    map.set('test', 'hi');
    map.set(key1, 'yo');
    map.set(key2, 'what up');

    expect(map.get('test')).to.equal('hi');
    expect(map.get(key1)).to.equal('yo');
    expect(map.get(key2)).to.equal('what up');
    expect(map.size).to.equal(3);
  });

  it('should allow setting keys twice', () => {
    const map = new MapPolyfill();
    const key1 = {};

    map.set(key1, 'sing');
    map.set(key1, 'yodel');

    expect(map.get(key1)).to.equal('yodel');
    expect(map.size).to.equal(1);
  });

  it('should have a delete method that removes keys', () => {
    const map = new MapPolyfill();
    const key1 = {};

    map.set(key1, 'sing');
    expect(map.size).to.equal(1);

    map.delete(key1);

    expect(map.size).to.equal(0);
    expect(map.get(key1)).to.be.a('undefined');
  });

  describe('prototype.forEach', () => {
    it('should exist', () => {
      const map = new MapPolyfill();
      expect(map.forEach).to.be.a('function');
    });

    it('should iterate over keys and values', () => {
      const expectedKeys = ['a', 'b', 'c'];
      const expectedValues = [1, 2, 3];
      const map = new MapPolyfill();
      map.set('a', 1);
      map.set('b', 2);
      map.set('c', 3);

      const thisArg = {
        arg: 'value'
      };

      //intentionally not using lambda to avoid typescript's this context capture
      map.forEach(function (value, key) {
        expect(this).to.equal(thisArg);
        expect(value).to.equal(expectedValues.shift());
        expect(key).to.equal(expectedKeys.shift());
      }, thisArg);

      expect(expectedValues.length).to.equal(0);
      expect(expectedKeys.length).to.equal(0);
    });
  });
});
