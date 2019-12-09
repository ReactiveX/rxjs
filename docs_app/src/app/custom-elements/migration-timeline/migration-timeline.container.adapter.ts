import {Inject} from '@angular/core';
import {combineLatest, Observable} from 'rxjs';
import {filter, map, tap} from 'rxjs/operators';
import {LocationService} from '../../shared/location.service';
import {MigrationTimelineService} from './data-access/migration-timeline.service';
import {MigrationTimelineContainerModelFromRemoteSources} from './migration-timeline.container.component';
import {getClosestRelease} from './utils/filter';
import {LocalState} from './utils/local-state.service';

@Inject({})
export class MigrationTimelineContainerAdapter extends LocalState<MigrationTimelineContainerModelFromRemoteSources> {
  private _selectedMigrationItemUIDFromUrl$: Observable<string> = this.locationService
    .currentUrl.pipe(
      tap(v => console.log('URL: ', v)),
      filter(v => !!v),
      map(_ => this.locationService.search().uid !== undefined ?
        this.locationService.search().uid : ''),
      tap(v => console.log('URL2: ', v))
    );

  releaseList$ = this.select(map(s => s.releaseList));

  constructor(
    private migrationService: MigrationTimelineService,
    private locationService: LocationService
  ) {
    super();
    this._selectedMigrationItemUIDFromUrl$.subscribe();
    this.locationService.subscribe();

    // Server state / Global state to component state
    // (re)fetch data  over http request
    this.migrationService.fetchMigrationTimeline();
    // Global state to view state
    this.connectSlice('releaseList', this.migrationService.migrations$);

    // URL state to component state
    // Connect Router to selectedMigrationReleaseUID
    this.connectSlice(
      combineLatest(
        this.releaseList$,
        this._selectedMigrationItemUIDFromUrl$
      ).pipe(
        map(([releaseList, selectedMigrationItemUID]) =>
          getClosestRelease(releaseList, selectedMigrationItemUID)),
        // @TODO parse to either version or version_uid
        map((migrationRelease) => {
          console.log('getClosestRelease: ', migrationRelease);
          return {selectedMigrationItemUID: migrationRelease.version};
        })
      )
    );
  }


}
