import {MigrationItemSubjectUIDFields, MigrationReleaseUIDFields} from './migration-uid';

export type MigrationItemTypeDeprecation = 'deprecation';

export type MigrationItemTypeBreakingChange = 'breakingChange';

export type MigrationItemTypes = MigrationItemTypeDeprecation | MigrationItemTypeBreakingChange;

export interface RawDeprecation extends MigrationItemSubjectUIDFields {
  itemType: MigrationItemTypeDeprecation;
  sourceLink: string;
  breakingChangeVersion: string;
  breakingChangeSubjectAction: string;
  deprecationMsgCode: string;
  breakingChangeMsg: string;
  reason: string;
  implication: string;
  exampleBeforeDependencies?: {[lib: string]: string},
  exampleBefore?: string;
  exampleAfterDependencies?: {[lib: string]: string},
  exampleAfter?: string;
  notes?: string;
}

export interface RawRelease extends MigrationReleaseUIDFields {
  date: string;
  sourceLink: string;
  deprecations: RawDeprecation[];
}
