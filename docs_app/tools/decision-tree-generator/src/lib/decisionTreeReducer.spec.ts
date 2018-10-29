import { decisionTreeReducer } from './decisionTreeReducer';
import { mockFlatApiList, mockRawTreeNodes } from './fixtures';
import { addUniqueId } from './addUniqueId';
import { rawNodesWithMethodCount } from './helpers';

describe('decisionTreeReducer', () => {
  const tree = decisionTreeReducer(addUniqueId(mockRawTreeNodes), mockFlatApiList);
  describe('all nodes', () => {
    const baseProperties = expect.objectContaining({
      id: expect.any(String),
      label: expect.any(String)
    });

    it('should have base properties', () => {
      for (const key in tree) {
        if (tree.hasOwnProperty(key)) {
          expect(tree[key]).toEqual(baseProperties);
        }
      }
    });

    describe('that have options', () => {
      it('should have an optons property that is an array of strings', () => {
        for (const key in tree) {
          if (
            tree.hasOwnProperty(key) &&
            tree[key].options
          ) {
            tree[key].options.forEach(option => {
              expect(typeof option).toBe('string');
            });
          }
        }
      });
    });

    describe('when a node does not have options', () => {
      it('should not have an options property', () => {
        for (const key in tree) {
          if (
            tree.hasOwnProperty(key) &&
            !tree[key].options
          ) {
            expect(tree[key]).not.toHaveProperty('options');
          }
        }
      });
      it('should have a docType and a path', () => {
        for (const key in tree) {
          if (
            tree.hasOwnProperty(key) &&
            !tree[key].options
          ) {
            expect(tree[key]).toHaveProperty('docType');
            expect(tree[key]).toHaveProperty('path');
          }
        }
      });

      describe('and the node does not exist in the API list', () => {
        const treeNodesMissingInApiList = [
          ...mockRawTreeNodes,
          {
            label: 'foo'
          }
        ];
        it('should call a console.log', () => {
          const spy = jest.spyOn(console, 'log');
          decisionTreeReducer(addUniqueId(treeNodesMissingInApiList), mockFlatApiList);
          expect(spy).toHaveBeenCalled();
        });
      });
    });

    describe('when any raw node had a method', () => {
      const rawCount = rawNodesWithMethodCount(mockRawTreeNodes);
      it('should have a method property', () => {
        let count = 0;
        for (const key in tree) {
          if (
            tree.hasOwnProperty(key) &&
            tree[key].method
          ) {
            count++;
          }
        }
        expect(count).toBe(rawCount);
      });
    });
  });
});
