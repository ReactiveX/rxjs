import { generateUniqueId } from './generateUniqueId';

describe('generateUniqueId', () => {
  describe('when called', () => {
    it('will generate a unique string', () => {
      const x = generateUniqueId();
      expect(x).not.toBe(generateUniqueId());
      expect(typeof x).toBe('string');
    });
  });
});
