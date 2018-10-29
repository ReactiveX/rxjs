import { isStable } from './helpers';

describe('isStable', () => {
  describe('when passed anything but the string "deprecated"', () => {
    it('will return true', () => {
      expect(isStable('')).toBeTruthy();
    });
  });
  describe('when passed the string "deprecated"', () => {
    it('will return false', () => {
      expect(isStable('deprecated')).toBeFalsy();
    });
  });
});
