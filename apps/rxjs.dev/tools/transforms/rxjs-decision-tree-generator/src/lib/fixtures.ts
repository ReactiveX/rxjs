import { TreeNodeRaw, FlattenedApiList, ApiListNode } from './interfaces';

export const mockRawTreeNodes: TreeNodeRaw[] = [
  {
    label: 'map'
  },
  {
    label: 'just a label',
    children: [
      {
        label: 'yet another label',
        children: [
          {
            label: 'concat'
          }
        ]
      }
    ]
  },
  {
    label: 'Observable',
    method: 'fakeMethod'
  }
];

export const mockFlatApiList = {
  map: {
    docType: 'function',
    path: 'fakePath'
  },
  mapTo: {
    docType: 'function',
    path: 'fakePath'
  },
  concat: {
    docType: 'function',
    path: 'fakePath'
  },
  Observable: {
    docType: 'class',
    path: 'fakePath'
  }
} as FlattenedApiList;

// TODO consider using the real API list
export const mockRawApiListWithDeprecatedRefs: ApiListNode[] = [
  {
    name: 'foo',
    title: 'foo',
    items: [
      {
        name: 'empty',
        title: 'EMPTY',
        path: 'api/index/function/empty',
        docType: 'function',
        stability: 'deprecated',
        securityRisk: false
      },
      {
        name: 'empty',
        title: 'EMPTY',
        path: 'api/index/const/EMPTY',
        docType: 'const',
        stability: '',
        securityRisk: false
      },
      {
        name: 'concat',
        title: 'concat',
        path: 'api/index/function/concat',
        docType: 'function',
        stability: '',
        securityRisk: false
      }
    ]
  },
  {
    name: 'bar',
    title: 'bar',
    items: [
      {
        name: 'never',
        title: 'NEVER',
        path: 'api/index/function/never',
        docType: 'function',
        stability: 'deprecated',
        securityRisk: false
      },
      {
        name: 'never',
        title: 'NEVER',
        path: 'api/index/const/NEVER',
        docType: 'const',
        stability: '',
        securityRisk: false
      },
      {
        name: 'map',
        title: 'map',
        path: 'api/index/function/map',
        docType: 'function',
        stability: '',
        securityRisk: false
      }
    ]
  }
];
