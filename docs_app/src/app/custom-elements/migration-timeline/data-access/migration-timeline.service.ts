import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {map} from 'rxjs/operators';
import {LocalState} from '../utils/local-state.service';
import {Release} from './interfaces';
import {deprecationAndBreakingChangeTimeline} from './migration-timeline';

// const migrationsPath = CONTENT_URL_PREFIX + 'migrations.json';
@Injectable()
export class MigrationTimelineService extends LocalState<{ migrations?: Release[] }> {

  private staticMigrations: Release[] = deprecationAndBreakingChangeTimeline;
  migrations$ = this.state$.pipe(map((s) => s.migrations));

  constructor() {
    super();
  }

  fetchMigrationTimeline(): void {
    this.connectSlice(of({migrations: this.staticMigrations}));
  }

}
