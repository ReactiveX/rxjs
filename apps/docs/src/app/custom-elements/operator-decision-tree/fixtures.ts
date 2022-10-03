import {
  OperatorDecisionTree,
  OperatorTreeNode,
  OperatorTreeNodeWithOptions
} from './interfaces';

export const treeNodeStubWithOptionsA: OperatorTreeNodeWithOptions = {
  id: 'treeNodeStubWithOptionsA',
  label: 'someLabelA',
  options: ['treeNodeStubWithOptionsB']
};

export const treeNodeStubWithOptionsB: OperatorTreeNodeWithOptions = {
  id: 'treeNodeStubWithOptionsB',
  label: 'someLabelB',
  options: ['treeNodeStubNoOptions']
};

export const treeNodeStubNoOptions: OperatorTreeNode = {
  id: 'treeNodeStubNoOptions',
  label: 'somelabelNoOptions',
  path: 'some/path/NoOptions',
  docType: 'someDocTypeNoOptions'
};

export const treeNodeInitialStub = {
  initial: {
    id: 'initial',
    options: ['treeNodeStubWithOptionsA']
  }
};

export const treeStub: OperatorDecisionTree = {
  [treeNodeStubWithOptionsA.id]: treeNodeStubWithOptionsA,
  [treeNodeStubWithOptionsB.id]: treeNodeStubWithOptionsB,
  [treeNodeStubNoOptions.id]: treeNodeStubNoOptions,
  ...treeNodeInitialStub
};
