import {MigrationItem, MigrationItemTypes} from './migration-item';
import {formatSemVerString, semVerString} from './semver';

export interface MigrationReleaseUIDFields {
  version: semVerString;
}

/*
MigrationItemUIDFields
description: Summarizes all information needed to generate the UID for a `MigrationItem`
*/
export interface MigrationItemUIDFields extends MigrationReleaseUIDFields, MigrationItemSubjectUIDFields {
}

/*
@Interface MigrationItemUIDFields

@field itemType
description: type of MigrationItem
type: TimeLineTypes

@field subject
description: subject of migration. What piece is effected?
@TODO consider this!
Subjects are things that components and things that are leafs
- class
  - method
    - argument
    - constant
    - var
    - let
  - property
- functions
  - argument
  - constant
  - var
  - let
- constant
- var
- let
type: string
Examples:
- TestScheduler
- of
- NEVER
- switchMap

There are 2 possible systems I see here:
- focusing on the subject e.g. last-function-resultSelector-deprecated
- focusing on the subjectAction e.g. last-argument-resultSelector-deprecated

APISymbol is what changes here. The thing to consider is we
get a nice icon (same as in the API reference in the docs) that
shows us the type of the subject i.e. class, function etc.



@field subjectApiSymbol
description: type of SubjectSymbols
type: SubjectSymbols

@field subjectAction
description: action on subject.
dash "-" separated string
- What happened to the subject?
- What attribute of the piece is effected?
type: string
Examples for deprecations:
- deprecated
- argument-resultSelector
- property-frameTimeFactor
- property-access-specifier-(private|public|readonly)-changed
- multiple-arguments
Examples for breakingChanges:
- removed
- moved
- to-private
- argument-resultSelector-removed
- property-frameTimeFactor-moved
- property-hotObservables-to-private
*/
export interface MigrationItemSubjectUIDFields {
  itemType: MigrationItemTypes;
  subject: string;
  subjectSymbol: SubjectSymbols;
  subjectAction: string;
}

/*
@enum subjectSymbols
description: string specifying a specific piece of typescript code
This information is a subset from the information from the [API explorer](https://rxjs.dev/api)
*/
export enum SubjectSymbols {
  all = 'all',
  class = 'class',
  interface = 'interface',
  function = 'function',
  enum = 'enum',
  const = 'enum',
  let = 'let',
  var = 'var',
  // @TODO reconsider => breaking change for every import of every operator?
  import = 'import',
  typeAlias = 'type-alias',
}

export enum SubjectActionSymbol {
  all = 'all',
  argument = 'argument',
  property = 'property',
  // @TODO reconsider
  genericArgument = 'generic-argument'
}

export function parseMigrationItemUID(
  item: MigrationItem,
  args: Partial<MigrationReleaseUIDFields> & Partial<MigrationItemSubjectUIDFields>
) {
  let {version} = args;
  version = formatSemVerString(version || '');
  const i: any = {...item, ...args};
  const migrationItemSubjectUID = parseMigrationItemSubjectUID(i);

  return `${version}_${migrationItemSubjectUID}`;
}


/*
parseMigrationItemSubjectUID
returns: MigrationItemSubjectUID
Pattern: <itemType>-<subjectApiSymbol>-<subject>-<subjectAction>
    - type: TimeLineTypes
    - subjectApiSymbol: ApiSymbol
    - subject: The subject of the item
      Examples:
      - TestScheduler
      - of
      - NEVER
      - switchMap
    - action-name: Thing done to the subject
      Examples:
      - deprecated
      - argument-resultSelector
      - property-frameTimeFactor
      - removed
      - moved
      - to-private
      - argument-resultSelector-removed
      - property-frameTimeFactor-moved
      - property-hotObservables-to-private
 */
export function parseMigrationItemSubjectUID(item: MigrationItem, args?: Partial<MigrationItemSubjectUIDFields>): any {
  const i = {...item, ...args};
  return `${i.itemType}-${i.subjectSymbol}-${i.subject}-${i.subjectAction}`;
}

export function parseMigrationReleaseUIDFromString(migrationItemUID: string): string {
  return migrationItemUID && migrationItemUID ? formatSemVerString(migrationItemUID.split('_')[0]) : '';
}

export function parseMigrationItemUIDObject(uid: string): MigrationItemSubjectUIDFields & MigrationReleaseUIDFields {
  const [releaseItemUID, _misUID] = uid ? uid.split('_') : ['', ''];
  const [itemType, subjectApiSymbol, subject, ...subjectActionArr] = _misUID ? _misUID.split('-') : ['', '', ''];
  const subjectAction = subjectActionArr.join('');
  return {
    version: formatSemVerString(releaseItemUID),
    itemType: itemType === 'deprecation' ? 'deprecation' : 'breakingChange',
    subject,
    subjectSymbol: subjectApiSymbol as SubjectSymbols,
    subjectAction
  };
}
