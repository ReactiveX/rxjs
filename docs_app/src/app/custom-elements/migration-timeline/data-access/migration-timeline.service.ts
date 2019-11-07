import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {LocalState} from '../utils/local-state.service';
import {Release} from './interfaces';
import {deprecationAndBreakingChangeTimeline} from './migration-timeline';

// const migrationsPath = CONTENT_URL_PREFIX + 'migrations.json';
@Injectable()
export class MigrationTimelineService extends LocalState<{ migrations?: Release[] }> {

  private initialMigrations = [];
  private staticMigrations: Release[] = deprecationAndBreakingChangeTimeline;
  migrations$: Observable<Release[]> = this.state$.pipe(map((s) => s.migrations), startWith(this.initialMigrations));

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
