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
  MigrationItem,
  MigrationItemSubjectUIDFields,
  MigrationReleaseUIDFields,
  SemVerObj
} from '../data-access/migration-timeline-struckture/interfaces';

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

export function parseSemVerObject(version: string): SemVerObj {
  // "6.2.3-rc.1" => major: 6, minor: 2, _mid: 3-rc, subVersion: 1
  // "6.2.3-rc." => major: 6, minor: 2, _mid: 3-rc
  // "6.2.3-rc" => major: 6, minor: 2, _mid: 3-rc
  // "6.2.3" => major: 6, minor: 2, _mid: 3
  // "6.2" => major: 6, minor: 2
  // "6" => major: 6
  const [major, minor, _mid, subVersion] = version.split('.');
  // "3-rc" => 3, rc
  // "3" => 3
  const [patch, subVersionName] = _mid ? _mid.split('-') : [0, false];

  const obj: SemVerObj = {
    major: +major,
    minor: +minor,
    patch: +patch
  };
  if (subVersionName !== undefined) {
    obj.subVersionName = subVersionName + '';
  }
  if (subVersionName !== undefined) {
    obj.subVersion = +subVersion;
  }

  return obj;
}

export function formatSemVerNumber(version: string): number {
  const _obj: SemVerObj = parseSemVerObject(version);
  const filledVersionNumber = {
    ..._obj,
    subVersionName: getSubVersionNumber(_obj.subVersionName),
    subVersion: 0,
  };
  return +[
    filledVersionNumber.major,
    filledVersionNumber.minor,
    filledVersionNumber.patch,
    filledVersionNumber.subVersionName,
    filledVersionNumber.subVersion
  ].join('');

  function getSubVersionNumber(sV?: string): string {
    let code: string = sV !== undefined ? sV.charCodeAt(0) + '' : '097';
    if (code.length < 3) {
      code = '0' + code;
    }
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
  // "3-rc" => patch: 3, subVersionName: rc
  // "3" => patch: 3, subVersionName: undefined
  // "" => patch: 0, subVersionName: undefined
  const [patch, subVersionName] = _mid ? _mid.split('-') : [0, undefined];
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
