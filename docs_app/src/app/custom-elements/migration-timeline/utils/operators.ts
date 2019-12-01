import {Observable} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';
import {BreakingChange, ClientRelease, Deprecation, TimeLineTypes} from '../data-access/interfaces';
import {SemVerObj, VmReleaseListItem} from '../migration-timeline.interface';

/*
  Pattern: <version>-<itemSubId>
  - version: string
    Examples:
    - 6.1.0
    - 7.0.0-alpha.1
  - itemSubId: <type>-<subjectApiSymbol>-<subject>-<action-name>
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
  Examples:
  - 6.0.1_deprecation-class-TestScheduler-index-to-private
  - 7.0.0-alpha.1_breakingChange-operator-switchMap-resultSelector-to-map-operator
  */
export function getItemHash(item: Deprecation | BreakingChange, args: { version: string, type?: TimeLineTypes, link?: string }) {
  let {version, link} = args;
  const subId = getItemSubId(item, {link});

  version = formatSemVerString(version);
  if (!link) {
    link = item.subjectAction;
  }
  return `${version}_${subId}`;
}

/*
   Pattern: <type>-<subjectApiSymbol>-<subject>-<action-name>
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
export function getItemSubId(item: Deprecation | BreakingChange, args: { link?: string }): any {
  let {link} = args;
  let type = 'breakingChange';
  if ('breakingVersion' in item) {
    type = 'deprecation';
  }
  if (!link) {
    link = item.subjectAction;
  }
  return `${type}-${item.subjectApiSymbol}-${item.subject}-${link}`;
}

export function getClosestRelevantVersion(version = '') {
  return (rL: ClientRelease[]): string => {

    if (rL) {
      const closestRelease = rL.find(release => {
        if (release.version === version) {
          return true;
        }
        const [rMajor, rMinor, rMid, rSubV] = release.version.split('.');
        const [rPatch, rName] = rMid ? rMid.split('-') : [0, 0];

        const [sMajor, sMinor, sMid, sSubV] = version.split('.');
        const [sPatch, sName] = sMid ? sMid.split('-') : [0, 0];

        let rNameVal;
        let sNameVal;
        if (rName < sName) {
          rNameVal = 0;
          sNameVal = 1;
        }
        if (rName > sName) {
          rNameVal = 1;
          sNameVal = 0;
        }
        if (rName > sName) {
          rNameVal = 0;
          sNameVal = 0;
        }
        const currentVersion = [rMajor, rMinor, rPatch, rNameVal, rSubV].map(n => n || 0).join('');
        const selectedVersion = [sMajor, sMinor, sPatch, sNameVal, sSubV].map(n => n || 0).join('');
        if (currentVersion >= selectedVersion) {
          return true;
        }
        return false;
      });
      return closestRelease ? closestRelease.version : version;
    }
    return version;
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
  // "3-rc" => 3, rc
  // "3" => 3
  const [patch, subVersionName] = _mid ? _mid.split('-') : [0, false];

  const main = [major, minor, patch].map(n => n || 0).join('.');
  const sub = subVersionName && subVersion ? '-' + subVersionName + '.' + subVersion : '';
  return main + sub;
}


export const getLatestRelevantVersion = (date: Date) => (rL: ClientRelease[]): string => {
  if (rL) {
    const reIndex = rL.findIndex(r => {
      const reDate = new Date(r.date);
      if (!reDate) {
        return false;
      }
      return reDate.getTime() > date.getTime();
    });

    if (reIndex !== -1) {
      if (reIndex === 0) {
        return rL[reIndex].version;
      }
      return rL[reIndex - 1].version;
    }
  }
  return '';
};

export const closestRelevantVersion = (list$: Observable<VmReleaseListItem[]>) =>
  (version$: Observable<string>): Observable<string> => version$
    .pipe(
      switchMap((hash) => {
        const [version] = hash.split('_');
        return list$.pipe(
          map(getClosestRelevantVersion(version))
        );
      })
    );

export const latestRelevantVersion = (list$: Observable<ClientRelease[]>) => (date$: Observable<Date>): Observable<string> => date$
  .pipe(
    switchMap(date => list$.pipe(
      map(getLatestRelevantVersion(date))
    ))
  );



