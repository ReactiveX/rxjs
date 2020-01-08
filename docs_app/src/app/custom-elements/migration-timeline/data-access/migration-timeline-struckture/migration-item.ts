import {MigrationItemSubjectUIDFields, MigrationReleaseUIDFields} from './migration-uid';

/*
@type TimeLineTypeDeprecation
*/
export type MigrationItemTypeDeprecation = 'deprecation';
/*
@type TimeLineTypeBreakingChange
*/
export type MigrationItemTypeBreakingChange = 'breakingChange';
/*
@type TimeLineTypes
*/
export type MigrationItemTypes = MigrationItemTypeDeprecation | MigrationItemTypeBreakingChange;

/*
@type MigrationItem
*/
export type MigrationItem = Deprecation | BreakingChange;

/*
@Interface Deprecation

@field itemType
description: Override of `MigrationItemUIDFields` property `itemType` to MigrationTimeTypeDeprecation
type: TimeLineTypeDeprecation
Example:
- deprecation

@field sourceLink
description: Link to the lines of code in GitHub in the version it got introduced.
Following things should be considered:
- The link should target the tag e.g. '.../blob/6.0.0-tactical-rc.1/src/...'
- The link should target the exact line of code e.g. '.../src/.ts#L42'
  - If multiple lines are effected the link should include all of them e.g. '.../src/.ts#L21-L42'
type: string
Example:
https://github.com/ReactiveX/rxjs/blob/6.0.0-tactical-rc.1/src/internal/Scheduler.ts#L20

@field breakingVersion
description: semver string of breaking version
type: string

@field breakingSubjectAction
description: subjectAction of related `BreakingChange` item
type: string
Example:

@field deprecationMsgCode
description: The <HumanReadableShortMessage> part from the code placed next to `@deprecated` section without the link.
The Pattern for the text in the source code is: <HumanReadableShortMessage> - see <LinkToDeprecationPage>
type: string

@field reason
description: Short explanation of why the deprecation got introduced
type: string

@field implication
description: This section is an explanation that accompanies the 'before deprecation' and 'after deprecation' snippets.
It explains the different between the two versions to the user
in a detailed way to help the user to spot the differences in code.
type: string

@field exampleBefore
description: Code example showing the situation before the deprecation.
Consider following guide lines:
- No '$' notation
- One line between imports asn code
- const source ... => ... source.subscribe(next: n => console.log(n));
- It has to work in StackBlitz in the right version
- Code should log a result

type: string
Pattern:
  <imports>
  <code>
Example:
  import {empty} from 'rxjs';
  empty();

@field exampleAfter
description: Code example showing the situation before the deprecation
type: string
Pattern:
  <imports>
  <code>
Example:
  import {EMPTY} from 'rxjs';
  EMPTY;
*/
export interface Deprecation extends MigrationItemSubjectUIDFields {
  itemType: MigrationItemTypeDeprecation;
  sourceLink: string;
  breakingChangeVersion: string;
  breakingChangeSubjectAction: string;
  deprecationMsgCode: string;
  reason: string;
  implication: string;
// @TODO Ensure this is the way to handle dependencies to other libs in stackblitz
  exampleBeforeDependencies?: {[lib: string]: string},
  exampleBefore?: string;
  // @TODO Ensure this is the way to handle dependencies to other libs in stackblitz
  exampleAfterDependencies?: {[lib: string]: string},
  exampleAfter?: string;
  notes?: string;
}

/*
@Interface BreakingChange

@field itemType
description: Override of `MigrationItemUIDFields` property `itemType` to MigrationTimeTypeBreakingChange
type: MigrationTimeTypeBreakingChange
Example:
- breakingChange

@field deprecationVersion
description: semver string of release where deprecation got introduced
type: string

@field deprecationSubjectAction
description: subjectAction of related `Deprecation` item
type: string

@field: breakingChangeMsg
description: A message that explains what exactly is breaking
type: string
Example: Class `TestScheduler` changed property `coldObservables` to private
 */
export interface BreakingChange extends MigrationItemSubjectUIDFields {
  itemType: MigrationItemTypeBreakingChange;
  deprecationVersion: string;
  deprecationSubjectAction: string;
  breakingChangeMsg: string;
  notes?: string;
}

/*
@Interface MigrationRelease

@field date
description: Any valid UTC string.
- When did the releases happen?
- When will the release most probably happen?
type: string
Examples:
- YYYY
- YYYY-MM
- YYYY-MM-DD

@field deprecations
description: A list of Deprecation items
type: Deprecation[]

@field breakingChanges
type: BreakingChange[]
description: A list of BreakingChange items
*/
export interface MigrationReleaseItem extends MigrationReleaseUIDFields {
  date: string;
  deprecations: Deprecation[];
  breakingChanges: BreakingChange[];
}
