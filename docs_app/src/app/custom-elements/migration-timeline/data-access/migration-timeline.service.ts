import {Injectable} from '@angular/core';
import {Observable, of, pipe} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {LocalState} from '../utils/local-state.service';
import {BreakingChange, Deprecation, MigrationReleaseItem} from './migration-timeline-struckture/interfaces';
import {deprecationAndBreakingChangeTimeline} from './migration-timeline.data';

export interface ClientRelease {
  // semver n.n.n.s-n,
  version: string,
  // JS Date
  date: Date;
  deprecations: Deprecation[];
  breakingChanges: BreakingChange[];
}

export interface MigrationTimelineState {
 migrations: ClientRelease[]
}
// const migrationsPath = CONTENT_URL_PREFIX + 'migrations.json';
@Injectable()
export class MigrationTimelineService extends LocalState<MigrationTimelineState> {

  private initialMigrations: ClientRelease[] = [];
  private staticMigrations: ClientRelease[] = this.parseServerToClientReleaseList(deprecationAndBreakingChangeTimeline);
  migrations$: Observable<ClientRelease[]> = this.select(pipe(map(s => s.migrations), startWith(this.initialMigrations)));

  constructor() {
    super();
  }

  parseServerToClientReleaseList(list: MigrationReleaseItem[]): ClientRelease[] {
    return list.map((r: MigrationReleaseItem): ClientRelease => {
      return {
        ...r,
        // @TODO create date obj for GMT+0 (or figure out in which timezone RxJS is released...)
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse
        // new Date(var + 'GMT+0')
        date: new Date(r.date),
      };
    })
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
