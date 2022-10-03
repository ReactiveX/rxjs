import { flattenApiList } from './flattenApiList';
import { mockRawApiListWithDeprecatedRefs } from './fixtures';
import { validApiRefCount } from './helpers';

describe('flattenApiList', () => {
  describe('when a API reference is deprecated', () => {
    const flattenedApiList = flattenApiList(mockRawApiListWithDeprecatedRefs);
    const validRefCount = validApiRefCount(mockRawApiListWithDeprecatedRefs);
    it('should return a flat list with only stable refs', () => {
      expect(Object.keys(flattenedApiList)).toHaveLength(validRefCount);
    });
  });
});


