import {comparePropertyFactory} from '../utils';
import {
  formatSemVerNumber, MigrationItemSubjectUIDFields,
  MigrationItemTypeBreakingChange,
  parseMigrationItemSubjectUID,
  parseMigrationItemUID,
  parseMigrationReleaseUIDFromString,
  RawDeprecation,
  RawRelease
} from './migration-timeline-structure';

export const compareByVersionNumberAsc = comparePropertyFactory(true, (i: Release) => i.versionNumber);

export const compareByReleaseDateAsc = comparePropertyFactory(true, (i: Release) => i.date, d => d.getTime());

export interface MigrationItemUIDAware {
  migrationItemUID: string;
  migrationReleaseUID: string;
  migrationItemSubjectUID: string;
  opponentMigrationItemUID: string;
}

export interface Deprecation extends RawDeprecation, MigrationItemUIDAware {

}

export interface BreakingChange extends MigrationItemUIDAware, MigrationItemSubjectUIDFields {
  itemType: MigrationItemTypeBreakingChange;
  deprecationVersion: string;
  deprecationSubjectAction: string;
  breakingChangeMsg: string;
  notes?: string;
}

export interface Release {
  version: string;
  versionNumber: number;
  officialRelease: boolean;
  date: Date;
  sourceLink: string,
  deprecations: Deprecation[];
  breakingChanges: BreakingChange[];
}

export function findClosestVersion(version = '') {
  return (rL: Release[]): string => {
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

export function findClosestRelease(rL: Release[], selectedMigrationTimelineItemUID = '') {
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

export const findLatestVersion = (date: Date) => (rL: Release[]): string => {
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
  return parts.length >= 4 ? migrationItemUID : '';
}

export function parseClientMigrationTimelineReleaseItem(
  r: RawRelease = {} as RawRelease,
  defaultOverrides: Partial<Release> = {}
): Release {
  const parsedRelease = {
    date: new Date('2021-01-01'),
    ...defaultOverrides
  } as Release;
  r.date && (parsedRelease.date = new Date(r.date));
  r.version && (parsedRelease.version = r.version);
  parsedRelease.officialRelease = parsedRelease.version.split('-').length < 2 || false;
  parsedRelease.versionNumber = formatSemVerNumber(parsedRelease.version);
  parsedRelease.deprecations || (parsedRelease.deprecations = []);
  parsedRelease.breakingChanges || (parsedRelease.breakingChanges = []);
  return parsedRelease;
}

export function getBreakingChangeFromDeprecation(d: RawDeprecation, r: { deprecationVersion: string }): BreakingChange {
  return parseToMigrationItemUIDAware<BreakingChange>(d.breakingChangeVersion)({
    itemType: 'breakingChange',
    subject: d.subject,
    subjectSymbol: d.subjectSymbol,
    subjectAction: d.breakingChangeSubjectAction,
    deprecationVersion: r.deprecationVersion,
    deprecationSubjectAction: d.subjectAction,
    breakingChangeMsg: d.breakingChangeMsg
  });
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

export function parseMigrationItemUIDURL(uid: string): string {
  const [migrationReleaseUID, migrationItemSubjectUID] = uid.split('_');
  const parsedReleaseUID = parseMigrationReleaseUIDFromString(migrationReleaseUID);
  const parsedMigrationItemSubjectUID = parseMigrationItemSubjectUIDFromString(migrationItemSubjectUID);
  return parsedMigrationItemSubjectUID !== '' ? parsedReleaseUID + '_' + parsedMigrationItemSubjectUID : parsedReleaseUID;
}
