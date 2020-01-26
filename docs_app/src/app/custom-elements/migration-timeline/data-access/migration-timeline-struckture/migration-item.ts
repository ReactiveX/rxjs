import {MigrationItemSubjectUIDFields, MigrationReleaseUIDFields} from './migration-uid';

export type MigrationItemTypeDeprecation = 'deprecation';

export type MigrationItemTypeBreakingChange = 'breakingChange';

export type MigrationItemTypes = MigrationItemTypeDeprecation | MigrationItemTypeBreakingChange;

export type MigrationItem = Deprecation | BreakingChange;

export interface Deprecation extends MigrationItemSubjectUIDFields {
  itemType: MigrationItemTypeDeprecation;
  sourceLink: string;
  breakingChangeVersion: string;
  breakingChangeSubjectAction: string;
  deprecationMsgCode: string;
  reason: string;
  implication: string;
  exampleBeforeDependencies?: {[lib: string]: string},
  exampleBefore?: string;
  exampleAfterDependencies?: {[lib: string]: string},
  exampleAfter?: string;
  notes?: string;
}

export interface BreakingChange extends MigrationItemSubjectUIDFields {
  itemType: MigrationItemTypeBreakingChange;
  deprecationVersion: string;
  deprecationSubjectAction: string;
  breakingChangeMsg: string;
  notes?: string;
}

export interface MigrationReleaseItem extends MigrationReleaseUIDFields {
  date: string;
  deprecations: Deprecation[];
  breakingChanges: BreakingChange[];
}
