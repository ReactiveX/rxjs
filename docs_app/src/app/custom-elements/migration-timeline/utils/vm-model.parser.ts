import {Deprecation, Release} from '../data-access/interfaces';
import {VmDeprecation, VmMigrationListItem, VmReleaseNavigationItem} from '../interfaces';

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

export function parseVmMigrationList(releases: Release[]): VmMigrationListItem[] {
  // res.concat(release.deprecations    ? release.deprecations.map(parseReleaseListItem) : []);
  return releases.map(release => ({
    version: release.version,
    title: parseVmDeprecationTitle(release),
    link: release.version,
    deprecations: release.deprecations.map(parseVmDeprecationItem(release.version)),
    breakingChanges: []
  }));
}

export function parseVmDeprecationItem(version: string) {
  return (i: Deprecation): VmDeprecation => {
    return {
      title: i.headline,
      reason: i.reason,
      implication: i.implication,
      breakingVersion: i.breakingVersion,
      exampleBeforeTitle: `Before Deprecation (< ${version})`,
      exampleBefore: i.exampleBefore,
      exampleAfterTitle: `After Deprecation (>= ${version})`,
      exampleAfter: i.exampleAfter,
    };
  };
}

