import { addUniqueId } from './addUniqueId';
import { TreeNode } from './interfaces';
import { mockRawTreeNodes } from './fixtures';

describe('addUniqueId', () => {
  describe('when called with three raw nodes', () => {
    let tree: TreeNode[];
    const baseProperties = jasmine.objectContaining({
      id: jasmine.any(String),
      label: jasmine.any(String),
      depth: jasmine.any(Number),
    });

    beforeEach(() => {
      tree = addUniqueId(mockRawTreeNodes);
    });

    describe('and one of the nodes is a child of another', () => {
      it('should not flatten the tree and return the same number of top level nodes', () => {
        expect(tree.length).toBe(mockRawTreeNodes.length);
      });
      it('should return an array of tree nodes that have unique ids', () => {
        tree.forEach((node) => {
          expect(node).toEqual(baseProperties);

          if (!node.children) {
            expect(node.options).toBeUndefined();
          } else {
            expect(node).toEqual(
              jasmine.objectContaining({
                children: jasmine.any(Array),
                options: jasmine.any(Array),
              })
            );
            node.children.forEach((child) => {
              expect(child).toEqual(baseProperties);
            });
          }
        });
      });
    });
  });
});
