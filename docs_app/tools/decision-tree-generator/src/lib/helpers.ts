export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

/**
 * The model for an API list item has a stability property.
 * If the API reference is deprecated it will not be stable.
 * We don't want to point people to deprecated API references.
 *
 * @export
 * @param {string} stability
 * @returns {boolean}
 */
export function isStable(stability: string): boolean {
  return stability !== 'deprecated';
}

/**
 * Recursively count the number of tree nodes
 *
 * @export
 * @param {*} tree
 * @returns
 */
export function treeNodeCount(tree) {
  return tree.reduce((acc: number, curr) => {
    let childSum: number;
    if (curr.children) {
      childSum = treeNodeCount(curr.children);
      return ++acc + childSum;
    }

    return ++acc;
  }, 0);
}

/**
 * Recursively count the number of nodes with a method
 *
 * @export
 * @param {*} tree
 * @returns
 */
export function rawNodesWithMethodCount(tree) {
  return tree.filter(node => {
    let childHadMethod: boolean;

    if (node.method) {
      return node;
    }

    if (node.children) {
      childHadMethod = rawNodesWithMethodCount(node.children);
    }

    return childHadMethod;
  }).length;
}


/**
 * Recursively count valid API references
 * Deprecated API refs are invalid
 *
 * @export
 * @param {*} apiList
 * @returns
 */
export function validApiRefCount(apiList): number {
  return apiList.reduce((acc, curr) => {
    const itemCount = curr.items.reduce((a, node) => {
      if (node.stability === 'deprecated') {
        return a;
      }

      return ++a;
    }, 0);

    return acc + itemCount;
  }, 0);
}
