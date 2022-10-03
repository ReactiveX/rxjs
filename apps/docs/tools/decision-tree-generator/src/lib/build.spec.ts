import { build } from './build';
import { mockFlatApiList, mockRawTreeNodes } from './fixtures';
import { treeNodeCount } from './helpers';

describe('build', () => {
  const tree = build(mockFlatApiList, mockRawTreeNodes);
  it('should return a flat map of all nodes and one additional initial node', () => {
    expect(tree).toHaveProperty('initial');
    expect(Object.keys(tree).length).toBe(treeNodeCount(mockRawTreeNodes) + 1);
  });
});
