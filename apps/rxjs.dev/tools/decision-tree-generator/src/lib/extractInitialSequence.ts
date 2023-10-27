import { TreeNode } from './interfaces';

/**
 * Strip out initial sequence and add to tree
 *
 * @export
 * @param {Tree} tree
 * @returns {{id: string, options: string[]}}
 */
export function extractInitialSequence(tree: TreeNode[]): {id: string, options: string[]} {
  return {
    id: 'initial',
    options: tree.filter(node => !node.depth).map(node => node.id)
  };
}
