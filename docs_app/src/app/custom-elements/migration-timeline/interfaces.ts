
export interface VmReleaseNavigationItem {
  date: string;
  // shortcut to list selection
  version: string;
  link: string;
}

export interface VmDeprecation {
  title: string;
  reason: string;
  breakingVersion: string;
}

export interface VmMigrationListItem {
  version: string;
  title: string;
  link: string;
  deprecations: VmDeprecation[];
  breakingChanges?: any[];
}

export type VmMigrationList = VmMigrationListItem[];
