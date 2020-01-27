import {Injectable} from '@angular/core';
import {Observable, of, pipe} from 'rxjs';
import {map, startWith} from 'rxjs/operators';

import {GlobalState} from '../utils';
import {ClientMigrationTimelineReleaseItem, compareByReleaseDateAsc, parseClientMigrationTimelineReleaseItem} from './migration-item';
import {deprecationAndBreakingChangeTimeline} from './migration-timeline-struckture/migration-timeline.data';

export interface MigrationTimelineState {
  migrations: ClientMigrationTimelineReleaseItem[]
}

@Injectable()
export class MigrationTimelineService extends GlobalState<MigrationTimelineState> {

  private initialMigrations: ClientMigrationTimelineReleaseItem[] = [];
  private staticMigrations: ClientMigrationTimelineReleaseItem[] =
    deprecationAndBreakingChangeTimeline.map(release => parseClientMigrationTimelineReleaseItem(release));
  migrations$: Observable<ClientMigrationTimelineReleaseItem[]> = this.select(pipe(
    map(s => s.migrations), startWith(this.initialMigrations))
  );

  constructor() {
    super();
    this.fetchMigrationTimeline();
  }

  fetchMigrationTimeline(): void {
    this.connectState(of({
        migrations: this.staticMigrations.sort(compareByReleaseDateAsc)
      })
    );
  }

}
