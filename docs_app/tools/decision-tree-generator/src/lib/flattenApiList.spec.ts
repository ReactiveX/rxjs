import { flattenApiList } from './flattenApiList.js';
import { mockRawApiListWithDeprecatedRefs } from './fixtures.js';
import { validApiRefCount } from './helpers.js';

describe('flattenApiList', () => {
  describe('when a API reference is deprecated', () => {
    const flattenedApiList = flattenApiList(mockRawApiListWithDeprecatedRefs);
    const validRefCount = validApiRefCount(mockRawApiListWithDeprecatedRefs);
    it('should return a flat list with only stable refs', () => {
      expect(Object.keys(flattenedApiList)).toHaveLength(validRefCount);
    });
  });
});


