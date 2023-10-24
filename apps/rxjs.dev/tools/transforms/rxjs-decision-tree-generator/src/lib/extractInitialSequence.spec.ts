import { extractInitialSequence } from './extractInitialSequence';
import { addUniqueId } from './addUniqueId';
import { mockRawTreeNodes } from './fixtures';

const tree = addUniqueId(mockRawTreeNodes);
const initialSequence = extractInitialSequence(tree);

describe('extractInitialSequence', () => {
  describe('when given a tree that has passed through addUniqueId', () => {
    it('will return an object that has an id of initial', () => {
      expect(initialSequence).toEqual({
        id: 'initial',
        options: jasmine.any(Array)
      });
    });

    it('it will return a number of options equal to the length of the original tree', () => {
      expect(initialSequence.options.length).toBe(mockRawTreeNodes.length);
    });
  });
});
