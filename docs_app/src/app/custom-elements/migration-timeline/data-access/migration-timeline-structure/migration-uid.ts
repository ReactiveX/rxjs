import {MigrationItemTypes} from './raw-migration-item';
import {formatSemVerString} from './semver';

export interface MigrationReleaseUIDFields {
  version: string;
}

export interface MigrationItemUIDFields extends MigrationReleaseUIDFields, MigrationItemSubjectUIDFields {
}

export interface MigrationItemSubjectUIDFields {
  itemType: MigrationItemTypes;
  subject: string;
  subjectSymbol: SubjectSymbols;
  subjectAction: string;
}

export enum SubjectSymbols {
  all = 'all',
  class = 'class',
  interface = 'interface',
  function = 'function',
  enum = 'enum',
  const = 'enum',
  let = 'let',
  var = 'var',
  symbol = 'symbol',
  import = 'import',
  typeAlias = 'type-alias',
}

export enum SubjectActionSymbol {
  all = 'all',
  argument = 'argument',
  property = 'property',
  genericArgument = 'generic-argument'
}

export function parseMigrationItemUID(
  item: any,
  args: Partial<MigrationReleaseUIDFields> & Partial<MigrationItemSubjectUIDFields>
) {
  let {version} = args;
  version = formatSemVerString(version || '');
  const i: any = {...item, ...args};
  const migrationItemSubjectUID = parseMigrationItemSubjectUID(i);

  return `${version}_${migrationItemSubjectUID}`;
}

export function parseMigrationItemSubjectUID(item: MigrationItemSubjectUIDFields, args?: Partial<MigrationItemSubjectUIDFields>): any {
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
