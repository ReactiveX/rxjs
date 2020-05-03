import {Injectable} from '@angular/core';
import {Observable, pipe} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {GlobalState} from '../../../shared/state.service';
import {
  Release,
  getBreakingChangeFromDeprecation,
  parseClientMigrationTimelineReleaseItem,
  parseToMigrationItemUIDAware,
  compareByVersionNumberAsc
} from './migration-item';
import {deprecationAndBreakingChangeTimeline, formatSemVerString, RawRelease} from './migration-timeline-structure';

export interface MigrationTimelineState {
  migrations: Release[]
}

@Injectable()
export class MigrationTimelineService extends GlobalState<MigrationTimelineState> {

  private initialMigrations: Release[] = [];
  private staticMigrations: Release[] = this.getStaticMigrations();

  migrations$: Observable<Release[]> = this.select(pipe(
    map(s => s.migrations), startWith(this.initialMigrations))
  );

  constructor() {
    super();
    this.fetchMigrationTimeline();
  }

  fetchMigrationTimeline(): void {
    this.set({
        migrations: this.staticMigrations.sort(compareByVersionNumberAsc)
      });
  }

  getStaticMigrations(): Release[] {
    const rDMap = deprecationAndBreakingChangeTimeline
      .reduce((releaseMap: { [id: string]: Release }, release: RawRelease) => {
        const version = formatSemVerString(release.version);
        releaseMap[version] = parseClientMigrationTimelineReleaseItem(release);
        releaseMap[version].deprecations = release.deprecations
          .map(parseToMigrationItemUIDAware(version));
        return releaseMap;
      }, {} as { [id: string]: Release });

    (Object as any).entries(rDMap)
      .forEach(([deprecationVersion, release]) => {

        release.deprecations.forEach(d => {
          const breakingChangeVersion = formatSemVerString(d.breakingChangeVersion);
          rDMap[breakingChangeVersion] = parseClientMigrationTimelineReleaseItem({} as any, {
            ...rDMap[breakingChangeVersion],
            version: breakingChangeVersion
          });
          rDMap[breakingChangeVersion].breakingChanges
            .push(getBreakingChangeFromDeprecation(d, {deprecationVersion}));
        });
      });

    return (Object as any).entries(rDMap)
      .map(([_, r]) => r);
  }
}
