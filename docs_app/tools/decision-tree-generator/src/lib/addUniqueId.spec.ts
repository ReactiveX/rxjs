import { addUniqueId } from './addUniqueId';
import { TreeNode } from './interfaces';
import { mockRawTreeNodes } from './fixtures';

describe('addUniqueId', () => {
  describe('when called with three raw nodes', () => {
    let tree: TreeNode[];
    let baseProperties: jest.Expect;

    beforeEach(() => {
      tree = addUniqueId(mockRawTreeNodes);
      baseProperties = expect.objectContaining({
        id: expect.any(String),
        label: expect.any(String),
        depth: expect.any(Number),
      });
    });

    describe('and one of the nodes is a child of another', () => {
      it('should not flatten the tree and return the same number of top level nodes', () => {
        expect(tree).toHaveLength(mockRawTreeNodes.length);
      });
      it('should return an array of tree nodes that have unique ids', () => {
        tree.forEach(node => {
          expect(node).toEqual(baseProperties);

          if (!node.children) {
            expect(node).not.toHaveProperty('options');
          } else {
            expect(node).toEqual(expect.objectContaining({
              children: expect.any(Array),
              options: expect.any(Array),
            }));
            node.children.forEach(child => {
              expect(child).toEqual(baseProperties);
            });
          }
        });
      });
    });
  });
});
