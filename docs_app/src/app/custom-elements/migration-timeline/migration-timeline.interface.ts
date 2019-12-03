import {VmFilterForm} from './components/filter-form.component';
import {VmReleaseNavigationItem} from './components/release-navigation.component';
import {BreakingChange, Deprecation, semVerString} from './data-access/migration-timeline-struckture/interfaces';

export interface VmMigrationTimelineContainerView {
  releaseList: VmReleaseListItem[],
  releaseNavigation: VmReleaseNavigationItem[],
  selectedMigrationReleaseUID: string,
  selectedMigrationItemSubjectUID: string,
  filter: VmFilterForm
}

export interface MigrationItemUIDAware {
  migrationItemUID: string;
  migrationReleaseUID: string;
  migrationItemSubjectUID: string;
}

export interface VmDeprecation extends Deprecation, MigrationItemUIDAware {

}

export interface VmBreakingChange extends BreakingChange, MigrationItemUIDAware {

}

export interface VmReleaseListItem {
  version: semVerString;
  // semverNumber 0 0 0 097 0,
  versionNumber: number;
  officialRelease: boolean;
  // JS Date
  date: Date;
  deprecations: VmDeprecation[];
  breakingChanges: VmBreakingChange[];
}

