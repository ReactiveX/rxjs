import { isInitialDecision, treeIsErrorFree, nodeHasOptions } from './utils';

describe('isInitialDecision', () => {
  describe('when it is an initial decision', () => {
    it('should be true', () => {
      expect(isInitialDecision(['initial'])).toBe(true)
    });
  });

  describe('when it is not an initial decision', () => {
    it('should be false', () => {
      expect(isInitialDecision(['initial', 'foo'])).toBe(false)
    });
  });
});

describe('treeIsErrorFree', () => {
  describe('when the tree is error free', () => {
    it('should return true', () => {
      expect(treeIsErrorFree({})).toBe(true)
    });
  });

  describe('when the tree has an error', () => {
    it('should return false', () => {
      expect(treeIsErrorFree({error: true})).toBe(false)
    });
  });
});

describe('nodeHasOptions', () => {
  describe('when node has options', () => {
    it('should return true', () => {
      expect(nodeHasOptions({options: ['123']})).toBe(true)
    });
  });

  describe('when node has no options', () => {
    it('should return false', () => {
      expect(nodeHasOptions({})).toBe(false)
    });
  });
});
