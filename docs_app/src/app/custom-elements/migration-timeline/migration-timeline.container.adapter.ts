import {Inject} from '@angular/core';
import {combineLatest, Observable} from 'rxjs';
import {distinctUntilChanged, filter, map} from 'rxjs/operators';
import {LocationService} from '../../shared/location.service';
import {findClosestRelease, parseMigrationItemSubjectUIDFromString, parseMigrationItemUIDURL} from './data-access/migration-item';
import {MigrationTimelineService} from './data-access/migration-timeline.service';
import {MigrationTimelineContainerModelFromRemoteSources} from './migration-timeline.container.component';

import {State} from './utils';


@Inject({})
export class MigrationTimelineContainerAdapter extends State<MigrationTimelineContainerModelFromRemoteSources> {
  private _selectedMigrationTimelineItemUIDUrl$: Observable<string> = this.locationService.currentSearchParams
    .pipe(
      map(s => s.uid),
      filter(v => v !== undefined),
      map(uid => parseMigrationItemUIDURL(uid)),
      distinctUntilChanged()
    );

  releaseList$ = this.select(map(s => s.releaseList));

  constructor(
    private migrationService: MigrationTimelineService,
    private locationService: LocationService
  ) {
    super();

    this.connectState('releaseList', this.migrationService.migrations$);

    this.connectState('selectedMigrationItemUID',
      combineLatest(
        this.releaseList$,
        this._selectedMigrationTimelineItemUIDUrl$
      ).pipe(
        map(([releaseList, selectedMigrationItemUID]) => this.findSelectedMigrationItemUID(releaseList, selectedMigrationItemUID)))
    );
  }

  findSelectedMigrationItemUID(releaseList, selectedMigrationItemUID) {
    const release = findClosestRelease(releaseList, selectedMigrationItemUID);
    const migrationItemSubjectUID = parseMigrationItemSubjectUIDFromString(selectedMigrationItemUID.split('_')[1]);

    if (migrationItemSubjectUID === '') {
      return release.version;
    }

    const item = ([] as any[])
      .concat(release.deprecations)
      .concat(release.breakingChanges)
      .find(i => i.migrationItemUID === selectedMigrationItemUID);

    return item ? selectedMigrationItemUID : 'wrong-uid';
  }

}
