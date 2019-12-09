import {ClientMigrationTimelineReleaseItem} from '../data-access/migration-timeline.interface';
import {formatSemVerNumber} from './formatter-parser';

export function getClosestVersion(version = '') {
  return (rL: ClientMigrationTimelineReleaseItem[]): string => {

    if (rL) {
      const closestRelease = rL.find(release => {
        if (release.version === version) {
          return true;
        }
        const currentVersion = formatSemVerNumber(release.version);
        const selectedVersion = formatSemVerNumber(version);

        return currentVersion >= selectedVersion;
      });
      return closestRelease ? closestRelease.version : version;
    }
    return version;
  };
}
export function getClosestRelease(version = '') {
  return (rL: ClientMigrationTimelineReleaseItem[]): ClientMigrationTimelineReleaseItem => {

    if (rL) {
      const closestRelease = rL.find(release => {
        if (release.version === version) {
          return true;
        }
        const currentVersion = formatSemVerNumber(release.version);
        const selectedVersion = formatSemVerNumber(version);

        return currentVersion >= selectedVersion;
      });
      return closestRelease ? closestRelease : rL[0];
    }
    return rL[0];
  };
}

export const getLatestVersion = (date: Date) => (rL: ClientMigrationTimelineReleaseItem[]): string => {
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
