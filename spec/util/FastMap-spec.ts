import {FastMap} from '../../dist/cjs/util/FastMap';

/** @test {FastMap} */
describe('FastMap', () => {
  it('should exist', () => {
    expect(typeof FastMap).toBe('function');
  });

  it('should accept string as keys', () => {
    const map = new FastMap();
    const key1 = 'keyOne';
    const key2 = 'keyTwo';

    map.set(key1, 'yo');
    map.set(key2, 'what up');

    expect(map.get(key1)).toBe('yo');
    expect(map.get(key2)).toBe('what up');
  });

  it('should allow setting keys twice', () => {
    const map = new FastMap();
    const key1 = 'keyOne';

    map.set(key1, 'sing');
    map.set(key1, 'yodel');

    expect(map.get(key1)).toBe('yodel');
  });

  it('should have a delete method that removes keys', () => {
    const map = new FastMap();
    const key1 = 'keyOne';

    map.set(key1, 'sing');

    expect(map.delete(key1)).toBe(true);
    expect(map.get(key1)).toBe(null);
  });

  it('should clear all', () => {
    const map = new FastMap();
    const key1 = 'keyOne';
    const key2 = 'keyTwo';

    map.set(key1, 'yo');
    map.set(key2, 'what up');

    map.clear();

    expect(map.get(key1)).toBe(undefined);
    expect(map.get(key2)).toBe(undefined);
  });

  describe('prototype.forEach', () => {
    it('should exist', () => {
      const map = new FastMap();
      expect(typeof map.forEach).toBe('function');
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
        expect(this).toBe(thisArg);
        expect(value).toBe(expectedValues.shift());
        expect(key).toBe(expectedKeys.shift());
      }, thisArg);

      expect(expectedValues.length).toBe(0);
      expect(expectedKeys.length).toBe(0);
    });
  });
});