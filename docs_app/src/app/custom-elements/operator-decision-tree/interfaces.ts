export interface OperatorTreeNode {
  id: string;
  label?: string;
  options?: string[];
  path?: string;
  docType?: string;
  method?: string;
}

export interface OperatorTreeNodeWithOptions extends OperatorTreeNode {
  options: string[];
}

export interface OperatorDecisionTree {
  [key: string]: OperatorTreeNode;
  initial: Required<Pick<OperatorTreeNode, 'id' | 'options'>>;
  error?: any;
}

export interface State {
  previousBranchIds: string[];
  currentBranchId: string;
}
