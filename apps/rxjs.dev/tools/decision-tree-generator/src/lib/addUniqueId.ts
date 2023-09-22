import { TreeNode, TreeNodeRaw } from './interfaces';
import { generateUniqueId } from './generateUniqueId';

/**
 * Recursively walks the tree and adds unique ids.
 * It also aggregates nested nodes new unique IDs in an options field.
 * Depth is added to better determine later if it's an inital question
 *
 * @export
 * @param {Tree} tree
 * @param {number} [depth=0]
 * @requires generateUniqueId
 * @returns {Tree}
 */
export function addUniqueId(tree: TreeNodeRaw[], depth = 0): TreeNode[] {
  return tree.map(node => {
    let treeNode: TreeNode;
    treeNode = {
      label: node.label,
      id: generateUniqueId(),
      depth // used later in extractInitialSequence to determine the initial options
    };

    if (node.children) {
      const children = addUniqueId(node.children, depth + 1);
      treeNode = {
        ...treeNode,
        children,
        options: children.map(({ id }) => id)
      };
    }

    if (node.method) {
      treeNode = {
        ...treeNode,
        method: node.method
      };
    }

    return treeNode;
  });
}
