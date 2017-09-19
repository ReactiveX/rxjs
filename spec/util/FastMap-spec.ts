import { expect } from 'chai';
import { FastMap } from '../../dist/package/util/FastMap';

/** @test {FastMap} */
describe('FastMap', () => {
  it('should exist', () => {
    expect(FastMap).to.be.a('function');
  });

  it('should accept string as keys', () => {
    const map = new FastMap();
    const key1 = 'keyOne';
    const key2 = 'keyTwo';

    map.set(key1, 'yo');
    map.set(key2, 'what up');

    expect(map.get(key1)).to.equal('yo');
    expect(map.get(key2)).to.equal('what up');
  });

  it('should allow setting keys twice', () => {
    const map = new FastMap();
    const key1 = 'keyOne';

    map.set(key1, 'sing');
    map.set(key1, 'yodel');

    expect(map.get(key1)).to.equal('yodel');
  });

  it('should have a delete method that removes keys', () => {
    const map = new FastMap();
    const key1 = 'keyOne';

    map.set(key1, 'sing');

    expect(map.delete(key1)).to.be.true;
    expect(map.get(key1)).to.be.a('null');
  });

  it('should clear all', () => {
    const map = new FastMap();
    const key1 = 'keyOne';
    const key2 = 'keyTwo';

    map.set(key1, 'yo');
    map.set(key2, 'what up');

    map.clear();

    expect(map.get(key1)).to.be.a('undefined');
    expect(map.get(key2)).to.be.a('undefined');
  });

  describe('prototype.forEach', () => {
    it('should exist', () => {
      const map = new FastMap();
      expect(map.forEach).to.be.a('function');
    });

    it('should iterate over keys and values', () => {
      const expectedKeys = ['a', 'b', 'c'];
      const expectedValues = [1, 2, 3];
      const map = new FastMap();
      map.set('a', 1);
      map.set('b', 2);
      map.set('c', 3);
      const thisArg = {};

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
