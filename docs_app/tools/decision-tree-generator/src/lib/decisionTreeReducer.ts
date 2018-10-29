import chalk from 'chalk';
import {
  DecisionTree,
  FlattenedApiList,
  FlattenedApiNode,
  TreeNode
} from './interfaces';

/**
 * Recursively walks the tree and pulls relevant information from the API list.
 * Helps build the view model.
 *
 * @export
 * @param {Tree} tree
 * @param {FlattenedApiList} apiList
 * @returns {DecisionTree}
 */
export function decisionTreeReducer(
  tree: TreeNode[],
  apiList: FlattenedApiList
): DecisionTree {
  return tree.reduce((acc, curr) => {
    let nested;
    let treeNode: TreeNode = {
      // there might not be options, grab what we know is available
      id: curr.id,
      label: curr.label
    };

    if (curr.options) {
      // we are still deciding
      treeNode = {
        ...treeNode,
        options: curr.options
      };
    }

    if (!curr.options) {
      // we found the function/operator we want to use
      const apiNode: FlattenedApiNode = apiList[treeNode.label];
      if (!apiNode) {
        console.log(
          chalk.yellow('Decision Tree Generator - (reducer) - warning:'),
          `Label does not exist in API List: ${treeNode.label}`
        );
      }

      treeNode = {
        ...treeNode,
        ...apiNode // helps to build uri, used in Angular template
      };
    }

    if (curr.method) {
      // if we need to point at a method of a class, like Observable.create, helps to build uri
      treeNode = {
        ...treeNode,
        method: curr.method
      };
    }

    if (curr.children) {
      // there are children of the current node, recursively walk the paths to continue building the decision tree data
      nested = decisionTreeReducer(curr.children, apiList);
    }

    return {
      ...acc,
      ...nested,
      [treeNode.id]: treeNode
    };
  }, {});
}
