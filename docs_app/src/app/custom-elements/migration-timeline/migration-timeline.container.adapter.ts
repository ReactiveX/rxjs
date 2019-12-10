import {Inject} from '@angular/core';
import {combineLatest, Observable} from 'rxjs';
import {distinctUntilChanged, filter, map, tap} from 'rxjs/operators';
import {LocationService} from '../../shared/location.service';
import {ClientMigrationTimelineReleaseItem} from './data-access/migration-timeline.interface';
import {MigrationTimelineService} from './data-access/migration-timeline.service';
import {MigrationTimelineContainerModelFromRemoteSources} from './migration-timeline.container.component';
import {getClosestRelease} from './utils/filter';
import {parseMigrationItemSubjectUIDFromString, parseMigrationItemUIDURL} from './utils/formatter-parser';
import {LocalState} from './utils/local-state.service';
import {comparePropertyFactory} from './utils/sort';

@Inject({})
export class MigrationTimelineContainerAdapter extends LocalState<MigrationTimelineContainerModelFromRemoteSources> {
  private _selectedMigrationTimelineItemUIDUrl$: Observable<string> = this.locationService.currentSearchParams
    .pipe(
      map(s => s.uid),
      filter(v => v !== undefined),
      map(uid => parseMigrationItemUIDURL(uid)),
      distinctUntilChanged()
    );

  compareByVersionNumberAsc = comparePropertyFactory(true, (i: ClientMigrationTimelineReleaseItem) => i.versionNumber);
  compareByReleaseDateAsc = comparePropertyFactory(true, (i: ClientMigrationTimelineReleaseItem) => i.date, d => d.getTime());
  releaseList$ = this.select(map(s => s.releaseList));

  constructor(
    private migrationService: MigrationTimelineService,
    private locationService: LocationService
  ) {
    super();

    // Server state / Global state to component state
    // (re)fetch data  over http request
    this.migrationService.fetchMigrationTimeline();
    // Global state to view state
    this.connectSlice('releaseList', this.migrationService.migrations$
      .pipe(
        // ensure base sorting by version number before putting it into client state
        map(a => a.sort(this.compareByVersionNumberAsc))
      ));

    // URL state to component state
    // Connect Router to selectedMigrationReleaseUID
    this.connectSlice('selectedMigrationItemUID',
      combineLatest(
        this.releaseList$,
        this._selectedMigrationTimelineItemUIDUrl$
      ).pipe(
        map(([releaseList, selectedMigrationItemUID]) => {
          // get the release object for selectedMigrationItemUID (or the closest one)
          const release = getClosestRelease(releaseList, selectedMigrationItemUID);
          const migrationItemSubjectUID = parseMigrationItemSubjectUIDFromString(selectedMigrationItemUID.split('_')[1]);

          // If no subjectUID is specified forward only version
          if (migrationItemSubjectUID === '') {
            return release.version;
          }
          // If uid is ok search it
          const item = ([] as any[])
            .concat(release.deprecations)
            .concat(release.breakingChanges)
            .find(i => i.migrationItemUID === selectedMigrationItemUID);

          // @TODO Specified migrationItemUID not in list. Suggest opening an issue.
          if (!item) {
            console.error('Specified migrationItemUID not in list. Suggest opening an issue.');
          }
          return item ? selectedMigrationItemUID : 'wrong-uid';
        }))
    );
  }

}
