export type TimeLineTypeDeprecation = 'deprecation';
export type TimeLineTypeBreakingChange = 'breakingChange';
export type TimeLineTypes = TimeLineTypeDeprecation | TimeLineTypeBreakingChange

export enum ApiSymbols {
  all = 'all',
  argument = 'argument',
  decorator = 'decorator',
  directive = 'directive',
  pipe = 'pipe',
  class = 'class',
  interface = 'interface',
  function = 'function',
  enum = 'enum',
  const = 'enum',
  let = 'let',
  var = 'var',
  'typeAlias' = 'type-alias',
  module = 'module'
}

export interface Deprecation {
  // What piece is effected? i.e. never, switchMap
  subject: string;
  subjectApiSymbol: ApiSymbols;
  // What attribute of the piece is effected? i.e. multiple arguments to one ,resultSelector, accessor specifier private/public/readonly....
  subjectAction: string;
  // Link to line of code in GitHub in version it got introduced
  sourceLink: string;
  itemType: TimeLineTypeDeprecation;
  // semver n.n.n-s.n,
  breakingVersion: string;
  breakingLink: string;
  deprecationMsgCode: string;
  reason: string;
  implication: string;
  /*
  # exampleBefore
  Pattern:
  <imports>
  <code>
  Example:
  import {empty} from 'rxjs';
  empty();
  */
  exampleBefore: string;
  /*
  # exampleAfter
  Pattern:
  <imports>
  <code>
  Example:
  import {EMPTY} from 'rxjs';
  EMPTY;
  */
  exampleAfter: string;
}

export interface BreakingChange {
  // What piece is effected? i.e. never, switchMap
  subject: string;
  subjectApiSymbol: ApiSymbols;
  // What attribute of the piece is effected? i.e. multiple arguments to one ,resultSelector, accessor specifier private/public/readonly....
  subjectAction: string;
  itemType: TimeLineTypeBreakingChange;
  // semver n.n.n.s-n,
  deprecationVersion: string;
  /*
  see Deprecation.linkName
  */
  deprecationLink: string;
  breakingChangeMsgCode: string;
}

export interface ServerRelease {
  // semver n.n.n.s-n,
  version: string,
  // YYYY-MM-DD
  date: string;
  deprecations: Deprecation[];
  breakingChanges: BreakingChange[];
}

export interface ClientRelease {
  // semver n.n.n.s-n,
  version: string,
  // JS Date
  date: Date;
  deprecations: Deprecation[];
  breakingChanges: BreakingChange[];
}

