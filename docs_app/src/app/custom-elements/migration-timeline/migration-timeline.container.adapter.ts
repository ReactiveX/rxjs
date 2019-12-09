import {Inject} from '@angular/core';
import {Observable} from 'rxjs';
import {filter, map} from 'rxjs/operators';
import {LocationService} from '../../shared/location.service';
import {MigrationTimelineService} from './data-access/migration-timeline.service';
import {MigrationTimelineContainerModelFromRemoteSources} from './migration-timeline.container.component';
import {LocalState} from './utils/local-state.service';

@Inject({})
export class MigrationTimelineContainerAdapter extends LocalState<MigrationTimelineContainerModelFromRemoteSources> {
  private _selectedMigrationItemUIDFromUrl$: Observable<string> = this.locationService
    .currentHash.pipe(filter(v => !!v));

  constructor(
    private migrationService: MigrationTimelineService,
    private locationService: LocationService
  ) {
    super();

    // Server state / Global state to component state
    // (re)fetch data  over http request
    this.migrationService.fetchMigrationTimeline();
    // Global state to view state
    this.connectSlice('releaseList', this.migrationService.migrations$);

    // URL state to component state
    // Connect Router to selectedMigrationReleaseUID
    this.connectSlice(this._selectedMigrationItemUIDFromUrl$
      .pipe(
        map((selectedMigrationItemUID) => ({selectedMigrationItemUID}))
      )
    );

  }


}
