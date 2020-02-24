import {MigrationItemSubjectUIDFields, MigrationReleaseUIDFields} from './migration-uid';

export type MigrationItemTypeDeprecation = 'deprecation';

export type MigrationItemTypeBreakingChange = 'breakingChange';

export type MigrationItemTypes = MigrationItemTypeDeprecation | MigrationItemTypeBreakingChange;

export interface RawDeprecation extends MigrationItemSubjectUIDFields {
  itemType: MigrationItemTypeDeprecation;
  sourceLink: string;
  deprecationMsgCode: string;
  reason: string;
  implication: string;
  exampleBeforeDependencies?: {[lib: string]: string},
  exampleBefore?: string;
  exampleAfterDependencies?: {[lib: string]: string},
  exampleAfter?: string;
  breakingChangeVersion: string;
  breakingChangeSubjectAction: string;
  breakingChangeMsg: string;
  notes?: string;
}

export interface RawRelease extends MigrationReleaseUIDFields {
  date: string;
  sourceLink: string;
  deprecations: RawDeprecation[];
}
