import {Injectable} from '@angular/core';
import {Observable, of, pipe} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {LocalState} from '../utils/local-state.service';
import {Release} from './interfaces';
import {deprecationAndBreakingChangeTimeline} from './migration-timeline';


export interface MigrationTimelineState {
 migrations: Release[]
}
// const migrationsPath = CONTENT_URL_PREFIX + 'migrations.json';
@Injectable()
export class MigrationTimelineService extends LocalState<MigrationTimelineState> {

  private initialMigrations: Release[] = [];
  private staticMigrations: Release[] = deprecationAndBreakingChangeTimeline;
  migrations$: Observable<Release[]> = this.select(pipe(map(s => s.migrations), startWith(this.initialMigrations)));

  constructor() {
    super();
  }

  fetchMigrationTimeline(): void {
    this.connectSlice(of({
        migrations: this.staticMigrations.sort((a, b) => {
          if (a.date < b.date) { return -1; }
          if (a.date > b.date) { return 1; }
          return 0;
        })
      })
    );
  }

}
