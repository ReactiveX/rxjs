/*
  parseMigrationItemUID

  Pattern: <MigrationReleaseUID>-<MigrationItemSubjectUID>
  - MigrationReleaseUID: string
   - Pattern: <version>
    Examples:
    - 6.1.0
    - 7.0.0-alpha.1
  - MigrationItemSubjectUID:
  Pattern: <itemType>-<subjectApiSymbol>-<subject>-<subjectAction>
  Examples:
  - 6.0.1_deprecation-class-TestScheduler-index-to-private
  - 7.0.0-alpha.1_breakingChange-operator-switchMap-resultSelector-to-map-operator
*/
import {
  ApiSymbols,
  MigrationItem,
  MigrationItemSubjectUIDFields,
  MigrationReleaseUIDFields,
  SemVerObj
} from '../data-access/migration-timeline-struckture/interfaces';

/*
parseMigrationItemUIDFromString
Examples:
- (EMPTY STRING)
- 0.0.0-alpha.0 (proper semVerString)
- 0.0.0_subjectUID (proper migrationItemUID)
*/
export function parseMigrationItemUIDURL(uid: string): string {
  // parseMigrationItemUIDURL
  const [migrationReleaseUID, migrationItemSubjectUID] = uid.split('_');
  const parsedReleaseUID = parseMigrationReleaseUIDFromString(migrationReleaseUID);
  const parsedMigrationItemSubjectUID = parseMigrationItemSubjectUIDFromString(migrationItemSubjectUID);
  return parsedMigrationItemSubjectUID !== '' ? parsedReleaseUID + '_' + parsedMigrationItemSubjectUID : parsedReleaseUID;
}

export function parseMigrationReleaseUIDFromString(migrationItemUID: string): string {
  return migrationItemUID && migrationItemUID ? formatSemVerString(migrationItemUID.split('_')[0]) : '';
}

export function parseMigrationItemSubjectUIDFromString(migrationItemUID: string): string {
  const parts = migrationItemUID ? migrationItemUID.split('-') : [];
  // Pattern: <itemType>-<subjectApiSymbol>-<subject>-<subjectAction>
  return parts.length >= 4 ? migrationItemUID : '';
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
  return `${i.itemType}-${i.subjectApiSymbol}-${i.subject}-${i.subjectAction}`;
}

export function parseMigrationItemUIDObject(uid: string): MigrationItemSubjectUIDFields & MigrationReleaseUIDFields {
  const [releaseItemUID, _misUID] = uid ? uid.split('_') : ['', ''];
  const [itemType, subjectApiSymbol, subject, ...subjectActionArr] = _misUID ? _misUID.split('-') : ['', '', ''];
  const subjectAction = subjectActionArr.join('');
  return {
    version: formatSemVerString(releaseItemUID),
    itemType: itemType === 'deprecation' ? 'deprecation' : 'breakingChange',
    subject,
    subjectApiSymbol: subjectApiSymbol as ApiSymbols,
    subjectAction
  };
}

export function parseSemVerObject(version: string): SemVerObj {
  // "6.2.3-rc.1" => major: 6, minor: 2, _mid: 3-rc, subVersion: 1
  // "6.2.3-rc." => major: 6, minor: 2, _mid: 3-rc
  // "6.2.3-rc" => major: 6, minor: 2, _mid: 3-rc
  // "6.2.3" => major: 6, minor: 2, _mid: 3
  // "6.2" => major: 6, minor: 2
  // "6" => major: 6
  const [major, minor, _mid, subVersion] = version.split('.');
  // "3-rc" => 3, [rc]
  // "3-string-rc" => 3, [string, rc]
  // "3" => 3, []
  const [patch, ...subVersionNameArr] = _mid ? _mid.split('-') : [0, false];
  const subVersionName = subVersionNameArr.join('-');

  const obj: SemVerObj = {
    major: +major,
    minor: +minor,
    patch: +patch
  };

  if (subVersionName !== '') {
    obj.subVersionName = subVersionName + '';
    obj.subVersion = +subVersion;
  }

  return obj;
}

/*
formatSemVerNumber
returns the passed semver as number.

@field version
description: release version as string
type: string
Example:
1             => 100197000
1.0           => 100197000
1.1           => 110197000
1.1.0         => 110197000
1.1.1         => 111197000
1.1.2         => 112197000
1.1.1-alpha   => 111097000
1.1.1-alpha.0 => 111097000
1.1.1-alpha.1 => 111097001
1.1.1-beta.0  => 111098000
1.1.1-beta.1  => 111098001
*/
export function formatSemVerNumber(version: string): number {
  const _obj: SemVerObj = parseSemVerObject(version);
  const filledVersionNumber = {
    ..._obj,
    subVersionName: getSubVersionNameNumber(_obj.subVersionName),
    subVersion: getSubVersionNumber(_obj.subVersion),
  };

  return +[
    filledVersionNumber.major,
    filledVersionNumber.minor,
    filledVersionNumber.patch,
    filledVersionNumber.subVersionName,
    filledVersionNumber.subVersion
  ].join('');

  function getSubVersionNameNumber(sVN?: string): string {
    // public releases, versions without a sub version part (6.0.0) are equal to 197 (sorting)
    let code: string = sVN !== undefined ? sVN.charCodeAt(0) + '' : '197';
    code = Array(3 - code.length).fill('0').join('') + code;
    return code;
  }

  function getSubVersionNumber(sV?: number): string {
    let code: string = sV !== undefined ? sV + '' : '000';
    code = Array(3 - code.length).fill('0').join('') + code;
    return code;
  }
}

export function formatSemVerString(version: string): string {
  // "6.2.3-rc.1" => major: 6, minor: 2, _mid: 3-rc, subVersion: 1
  // "6.2.3-rc." => major: 6, minor: 2, _mid: 3-rc
  // "6.2.3-rc" => major: 6, minor: 2, _mid: 3-rc
  // "6.2.3" => major: 6, minor: 2, _mid: 3
  // "6.2" => major: 6, minor: 2
  // "6" => major: 6
  const [major, minor, _mid, subVersion] = version.split('.');
  // "3-rc" => patch: 3, subVersionName: [rc]
  // "3-string-rc" => patch: 3, subVersionName: [string, rc]
  // "3" => patch: 3, subVersionName: []
  // "" => patch: 0, subVersionName: []
  const [patch, ...subVersionNameArr] = _mid ? _mid.split('-') : [0, undefined];
  const subVersionName = subVersionNameArr.join('-');
  // [6,2,3] => 6.2.3
  // [undefined,undefined,undefined] => 0.0.0
  const main = [major, minor, patch].map(n => n || 0).join('.');
  // ['rc',1] => -rc.1
  // ['rc',undefined] =>
  // [undefined,undefined] =>
  const sub = subVersionName && subVersion ? '-' + subVersionName + '.' + subVersion : '';
  // 6.2.3 + -rc.1
  return main + sub;
}
