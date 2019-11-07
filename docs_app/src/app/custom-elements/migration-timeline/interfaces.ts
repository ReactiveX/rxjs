import {ApiSymbols} from './data-access/interfaces';

export interface VmReleaseNavigationItem {
  date: string;
  // shortcut to list selection
  version: string;
  link: string;
}

export interface VmDeprecation {
  subject: string;
  subjectApiSymbol: ApiSymbols;
  title: string;
  link: string;
  sourceLink: string;
  reasonTitle: string;
  reason: string;
  implicationTitle: string;
  implication: string;
  breakingVersionText: string;
  breakingVersion: string;
  breakingLink: string;
  exampleBeforeTitle: string;
  exampleBefore: string;
  exampleAfterTitle: string;
  exampleAfter: string;
}

export interface VmBreakingChange {
  subject: string;
  subjectApiSymbol: ApiSymbols;
  link: string;
  refactoringTitle: string;
  refactoringText: string;
  deprecationVersionText: string;
  deprecationVersion: string;
  deprecationLink: string;
  title: string;
}
export interface VmMigrationListItem {
  version: string;
  date: string;
  title: string;
  link: string;
  deprecations: VmDeprecation[];
  breakingChanges?: VmBreakingChange[];
}

export type VmMigrationList = VmMigrationListItem[];
