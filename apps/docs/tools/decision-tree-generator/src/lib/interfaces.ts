import { Omit } from './helpers';

export type DocType =
  | 'all'
  | 'class'
  | 'const'
  | 'enum'
  | 'function'
  | 'interface'
  | 'type-alias';

export type ApiUnion =
  | 'audit'
  | 'auditTime'
  | 'bindCallback'
  | 'bindNodeCallback'
  | 'buffer'
  | 'bufferCount'
  | 'bufferTime'
  | 'bufferToggle'
  | 'bufferWhen'
  | 'catchError'
  | 'combineLatest'
  | 'concat'
  | 'concat'
  | 'concatMap'
  | 'concatMapTo'
  | 'count'
  | 'debounce'
  | 'debounceTime'
  | 'defer'
  | 'delay'
  | 'delayWhen'
  | 'distinct'
  | 'distinctUntilChanged'
  | 'distinctUntilKeyChanged'
  | 'elementAt'
  | 'EMPTY'
  | 'exhaustMap'
  | 'expand'
  | 'filter'
  | 'finalize'
  | 'first'
  | 'forkJoin'
  | 'from'
  | 'fromEvent'
  | 'fromEventPattern'
  | 'generate'
  | 'groupBy'
  | 'ignoreElements'
  | 'interval'
  | 'last'
  | 'map'
  | 'mapTo'
  | 'materialize'
  | 'merge'
  | 'mergeMap'
  | 'mergeMapTo'
  | 'mergeScan'
  | 'multicast'
  | 'NEVER'
  | 'Observable'
  | 'observeOn'
  | 'of'
  | 'pairwise'
  | 'partition'
  | 'pipe'
  | 'pluck'
  | 'publish'
  | 'publishBehavior'
  | 'publishLast'
  | 'publishReplay'
  | 'race'
  | 'range'
  | 'reduce'
  | 'repeat'
  | 'repeatWhen'
  | 'retry'
  | 'retryWhen'
  | 'scan'
  | 'share'
  | 'single'
  | 'skip'
  | 'skipLast'
  | 'skipUntil'
  | 'skipWhile'
  | 'startWith'
  | 'subscribeOn'
  | 'switchMap'
  | 'switchMapTo'
  | 'take'
  | 'takeLast'
  | 'takeUntil'
  | 'takeWhile'
  | 'tap'
  | 'throttle'
  | 'throttleTime'
  | 'throwError'
  | 'timeInterval'
  | 'timeout'
  | 'timeoutWith'
  | 'timer'
  | 'toArray'
  | 'window'
  | 'windowCount'
  | 'windowTime'
  | 'windowToggle'
  | 'windowWhen'
  | 'withLatestFrom'
  | 'zip';

export interface ApiListItem {
  docType: DocType;
  name: string;
  path: string;
  securityRisk: boolean;
  stability: string;
  title: ApiUnion;
}

export interface ApiListNode {
  items: ApiListItem[];
  name: string;
  title: string;
}

export interface FlattenedApiNode {
  docType: DocType;
  path: string;
}

export type FlattenedApiList = {
  [K in ApiUnion]: FlattenedApiNode;
};

export interface TreeNodeRaw {
  label: string;
  children?: TreeNodeRaw[];
  method?: string;
}

export interface TreeNode {
  id: string;
  label?: string;
  children?: TreeNode[];
  depth?: number;
  docType?: DocType;
  method?: string;
  options?: string[];
  path?: string;
}

export interface DecisionTree {
  [key: string]: Omit<TreeNode, 'depth' | 'children'>;
}
