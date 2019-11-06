
export interface VmReleaseNavigationItem {
  date: string;
  // shortcut to list selection
  version: string;
  link: string;
}

export interface VmDeprecation {
  title: string;
  reason: string;
  implication: string;
  breakingVersion: string;
  exampleBeforeTitle: string;
  exampleBefore: string;
  exampleAfterTitle: string;
  exampleAfter: string;
}

export interface VmBreakingChange {
  title: string;
}
export interface VmMigrationListItem {
  version: string;
  title: string;
  link: string;
  deprecations: VmDeprecation[];
  breakingChanges?: VmBreakingChange[];
}

export type VmMigrationList = VmMigrationListItem[];
