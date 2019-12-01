import {VmFilterForm} from './components/filter-form.component';
import {BreakingChange, Deprecation} from './data-access/interfaces';

export interface SemVerObj {
  major: number,
  minor: number,
  patch: number,
  subVersionName?: string,
  subVersion?: number
}

export interface VmDeprecation extends Deprecation {
  itemHash: string
}

export interface VmBreakingChange extends BreakingChange {
  itemHash: string
}

export interface VmReleaseListItem {
  // semver n.n.n.s-n,
  version: string;
  // semverNumber 0 0 0 097 0,
  versionNumber: number;
  officialRelease: boolean;
  // JS Date
  date: Date;
  deprecations: VmDeprecation[];
  breakingChanges: VmBreakingChange[];
}

export interface VmReleaseNavigationItem {
  date: Date;
  versionNumber: number
  version: string;
  officialRelease: boolean
}

export interface VmTimelineContainerView {
  selectedVersion: string,
  selectedItemSubId: string,
  filter: VmFilterForm,
  releaseList: VmReleaseListItem[],
  releaseNavigation: VmReleaseNavigationItem[]
}
