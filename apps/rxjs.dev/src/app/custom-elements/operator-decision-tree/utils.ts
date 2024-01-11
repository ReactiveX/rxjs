import { OperatorDecisionTree, OperatorTreeNode, OperatorTreeNodeWithOptions } from './interfaces';

export function isInitialDecision(previousBranchIds: string[]): boolean {
  return (
    previousBranchIds.includes('initial') && previousBranchIds.length === 1
  );
}

export function treeIsErrorFree(tree: OperatorDecisionTree): boolean {
  return !tree.error;
}

export function nodeHasOptions(node: OperatorTreeNode): node is OperatorTreeNodeWithOptions {
  return !!node.options;
}
