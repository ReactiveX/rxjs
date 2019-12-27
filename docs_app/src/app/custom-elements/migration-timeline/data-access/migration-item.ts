
import {comparePropertyFactory} from '../utils/general';
import {Deprecation, BreakingChange, MigrationReleaseItem} from './migration-timeline-struckture/migration-item';
import {parseMigrationItemSubjectUID, parseMigrationItemUID,
  parseMigrationReleaseUIDFromString} from './migration-timeline-struckture/migration-uid';
import {formatSemVerNumber} from './migration-timeline-struckture/semver';

export const compareByVersionNumberAsc = comparePropertyFactory(true, (i: ClientMigrationTimelineReleaseItem) => i.versionNumber);

export const compareByReleaseDateAsc = comparePropertyFactory(true, (i: ClientMigrationTimelineReleaseItem) => i.date, d => d.getTime());

export interface MigrationItemUIDAware {
  migrationItemUID: string;
  migrationReleaseUID: string;
  migrationItemSubjectUID: string;
  opponentMigrationItemUID: string;
}

export interface ClientDeprecation extends Deprecation, MigrationItemUIDAware {

}

export interface ClientBreakingChange extends BreakingChange, MigrationItemUIDAware {

}

export interface ClientMigrationTimelineReleaseItem {
  version: string;
  // semverNumber 0 0 0 000 0,
  versionNumber: number;
  officialRelease: boolean;
  date: Date;
  deprecations: ClientDeprecation[];
  breakingChanges: ClientBreakingChange[];
}

export function findClosestVersion(version = '') {
  return (rL: ClientMigrationTimelineReleaseItem[]): string => {
    if (rL) {
      const closestRelease = rL.find(release => {
        if (release.version === version) {
          return true;
        }
        const currentVersion = release.versionNumber;
        const selectedVersion = formatSemVerNumber(version);

        return currentVersion >= selectedVersion;
      });
      return closestRelease ? closestRelease.version : version;
    }
    return version;
  };
}

export function findClosestRelease(rL: ClientMigrationTimelineReleaseItem[], selectedMigrationTimelineItemUID = '') {
  if (rL) {
    const selectedVersion = parseMigrationReleaseUIDFromString(selectedMigrationTimelineItemUID);
    const closestRelease = rL.find(release => {
      const selectedVersionNumber = formatSemVerNumber(selectedVersion);
      if (release.versionNumber === selectedVersionNumber) {
        return true;
      }
      return release.versionNumber >= selectedVersionNumber;
    });
    return closestRelease ? closestRelease : rL[0];
  }
  return rL[0];
}

export const findLatestVersion = (date: Date) => (rL: ClientMigrationTimelineReleaseItem[]): string => {
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

export function parseMigrationItemSubjectUIDFromString(migrationItemUID: string): string {
  const parts = migrationItemUID ? migrationItemUID.split('-') : [];
  // Pattern: <itemType>-<subjectApiSymbol>-<subject>-<subjectAction>
  return parts.length >= 4 ? migrationItemUID : '';
}

export function parseClientMigrationTimelineReleaseItem(r: MigrationReleaseItem): ClientMigrationTimelineReleaseItem {
  return {
    ...r,
    // @TODO create date obj for GMT+0 (or figure out in which timezone RxJS is released...)
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse
    // new Date(var + 'GMT+0')
    date: new Date(r.date),
    version: r.version,
    officialRelease: r.version.split('-').length < 2,
    versionNumber: formatSemVerNumber(r.version),
    deprecations: r.deprecations
      .map(parseToMigrationItemUIDAware(r.version)),
    breakingChanges: r.breakingChanges
      .map(parseToMigrationItemUIDAware(r.version)),
  } as ClientMigrationTimelineReleaseItem;
}

export function parseToMigrationItemUIDAware<T>(version: string) {
  return (item: any) => {
    const awareItem: T & MigrationItemUIDAware = {
      ...item,
      migrationReleaseUID: formatSemVerNumber(version) + '',
      migrationItemSubjectUID: parseMigrationItemSubjectUID(item, {}),
      migrationItemUID: parseMigrationItemUID(item, {version})
    };

    let opponentMigrationItemUID;
    if (item.itemType === 'deprecation') {
      opponentMigrationItemUID = parseMigrationItemUID(item, {
        itemType: 'breakingChange',
        version: item.breakingChangeVersion,
        subjectAction: item.breakingChangeSubjectAction
      });
      // i.itemType === 'breakingChange'
    } else {
      opponentMigrationItemUID = parseMigrationItemUID(item, {
        itemType: 'deprecation',
        version: item.deprecationVersion,
        subjectAction: item.deprecationSubjectAction
      });
    }
    awareItem.opponentMigrationItemUID = opponentMigrationItemUID;
    return awareItem;
  };
}

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

