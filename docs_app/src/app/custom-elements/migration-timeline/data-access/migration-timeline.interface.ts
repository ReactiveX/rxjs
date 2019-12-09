import {semVerString, Deprecation, BreakingChange} from './migration-timeline-struckture/interfaces';

export interface MigrationItemUIDAware {
  migrationItemUID: string;
  migrationReleaseUID: string;
  migrationItemSubjectUID: string;
  opponentMigrationItemUID: string;
}

export interface ClientDeprecation extends Deprecation, MigrationItemUIDAware {
  opponentMigrationItemUID: string;
}

export interface ClientBreakingChange extends BreakingChange, MigrationItemUIDAware {
  opponentMigrationItemUID: string;
}

export interface ClientMigrationTimelineReleaseItem {
  version: semVerString;
  // semverNumber 0 0 0 000 0,
  versionNumber: number;
  officialRelease: boolean;
  // JS Date
  date: Date;
  deprecations: ClientDeprecation[];
  breakingChanges: ClientBreakingChange[];
}
