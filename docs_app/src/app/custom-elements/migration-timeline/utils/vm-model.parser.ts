import {BreakingChange, Deprecation, Release} from '../data-access/interfaces';
import {VmBreakingChange, VmDeprecation, VmMigrationListItem, VmReleaseNavigationItem} from '../interfaces';

export function parseVmDeprecationTitle(base: { date: string, version: string }) {
  return `Deprecations introduced prior to ${base.date} ( ${base.version} )`;
}

export function parseVmReleaseNavigation(releases: Release[]): VmReleaseNavigationItem[] {
  return releases.reduce((res, release) => {
    const navigationItem: VmReleaseNavigationItem = {
      date: release.date,
      version: release.version,
      link: release.version
    };
    res.push(navigationItem);
    return res;
  }, [] as VmReleaseNavigationItem[]);
}

export function parseVmMigrationList(baseURL: string) {
  return (releases: Release[]): VmMigrationListItem[] => {
    // res.concat(release.deprecations    ? release.deprecations.map(parseReleaseListItem) : []);
    return releases.map(release => ({
      version: release.version,
      date: release.date,
      title: parseVmDeprecationTitle(release),
      link: release.version,
      deprecations: release.deprecations.map(parseVmDeprecationItem(release.version, baseURL)),
      breakingChanges: release.breakingChanges.map(parseVmBreakingChangeItem(release.version, baseURL)),
    }));
  };
}

export function parseVmDeprecationItem(version: string, baseURL: string) {
  return (i: Deprecation): VmDeprecation => {
    return {
      link: i.linkName,
      title: i.headline,
      sourceLink: i.sourceLink,
      subject: i.subject,
      subjectApiSymbol: i.subjectApiSymbol || 'all',
      breakingVersionText: 'Breaking change in version ',
      breakingVersion: i.breakingVersion,
      breakingLink: baseURL + i.breakingVersion,
      reasonTitle: 'Reason',
      reason: i.reason,
      implicationTitle: 'Implication',
      implication: i.implication,
      exampleBeforeTitle: `Before Deprecation (< v${version})`,
      exampleBefore: i.exampleBefore,
      exampleAfterTitle: `After Deprecation (>= v${version})`,
      exampleAfter: i.exampleAfter,
    };
  };
}

export function parseVmBreakingChangeItem(version: string, baseURL: string) {
  return (i: BreakingChange): VmBreakingChange => {
    return {
      link: i.linkName,
      title: i.headline,
      subject: i.subject,
      subjectApiSymbol: i.subjectApiSymbol || 'all',
      refactoringTitle: 'Refactoring',
      refactoringText: `For refactoring suggestions please visit `,
      deprecationVersionText: 'Deprecated in verion ',
      deprecationVersion: i.deprecationVersion,
      deprecationLink: baseURL + i.deprecationVersion
    };
  };
}

export function prefixVersion(version: string): string {
  return 'v' + version;
}

export function prefixHash(link: string): string {
  return '#' + link;
}

export function getClosestRelevantVersion(version = '') {
  return (rL: Release[]): string => {

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

export const getLatestRelevantVersion = (date: Date) => (rL: Release[]): string => {
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

