/*
@type string
description: Any valid semver string from only major [n] to very specific [n.n.n.s-n]. What version is effected?
type: string
Examples:
     - 1
     - 1.1
     - 1.1.1
     - 1.1.1-alpha.1
*/


/*
@Interface SemVerObj
description: semver as object
  type: string
*/
export interface SemVerObj {
  major: number,
  minor: number,
  patch: number,
  subVersionName?: string,
  subVersion?: number
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
