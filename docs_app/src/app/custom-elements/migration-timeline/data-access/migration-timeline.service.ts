import {Injectable} from '@angular/core';
import {Observable, of, pipe} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {LocalState} from '../utils/local-state.service';
import {ClientRelease, ServerRelease} from './interfaces';
import {deprecationAndBreakingChangeTimeline} from './migration-timeline.data';


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

  parseServerToClientReleaseList(list: ServerRelease[]): ClientRelease[] {
    return list.map((r: ServerRelease): ClientRelease => {
      return {
        ...r,
        // @TODO create date obj for GMT+0 (or figure out where RxJS is released.. haha)
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
