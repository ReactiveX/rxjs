export interface SemVerObj {
  major: number,
  minor: number,
  patch: number,
  subVersionName?: string,
  subVersion?: number
}

export function parseSemVerObject(version: string = ''): SemVerObj {
  const [major, minor, _mid, subVersion] = version.split('.');
  const [patch, ...subVersionNameArr] = _mid ? _mid.split('-') : [0, false];
  const subVersionName = subVersionNameArr.join('-');

  const obj: SemVerObj = {
    major: +(major || 0),
    minor: +(minor || 0),
    patch: +(patch || 0),
  };

  if (subVersionName !== '') {
    obj.subVersionName = subVersionName + '';
    obj.subVersion = +(subVersion || '000');
  }

  return obj;
}

export function formatSemVerNumber(version: string = ''): number {
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

  function getSubVersionNameNumber(sVN: string = ''): string {
    // public releases, versions without a sub version part (6.0.0) are equal to 197 (sorting)
    let code: string = sVN !== '' ? sVN.charCodeAt(0) + '' : '197';
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
  const [major, minor, _mid, subVersion] = version.split('.');
  const [patch, ...subVersionNameArr] = _mid ? _mid.split('-') : [0, undefined];
  const subVersionName = subVersionNameArr.join('-');
  const main = [major, minor, patch].map(n => n || 0).join('.');
  const sub = subVersionName && subVersion ? '-' + subVersionName + '.' + subVersion : '';
  return main + sub;
}
