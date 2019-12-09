import {Injectable} from '@angular/core';
import {Observable, of, pipe} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {formatSemVerNumber, parseMigrationItemSubjectUID, parseMigrationItemUID} from '../utils/formatter-parser';
import {LocalState} from '../utils/local-state.service';
import {MigrationReleaseItem} from './migration-timeline-struckture/interfaces';
import {deprecationAndBreakingChangeTimeline} from './migration-timeline.data';
import {ClientMigrationTimelineReleaseItem, MigrationItemUIDAware} from './migration-timeline.interface';

export interface MigrationTimelineState {
  migrations: ClientMigrationTimelineReleaseItem[]
}

@Injectable()
export class MigrationTimelineService extends LocalState<MigrationTimelineState> {

  private initialMigrations: ClientMigrationTimelineReleaseItem[] = [];
  private staticMigrations: ClientMigrationTimelineReleaseItem[] = this.
  _parseClientMigrationTimelineReleaseList(deprecationAndBreakingChangeTimeline);
  migrations$: Observable<ClientMigrationTimelineReleaseItem[]> = this.select(pipe(
    map(s => s.migrations), startWith(this.initialMigrations))
  );

  constructor() {
    super();
  }

  fetchMigrationTimeline(): void {
    this.connectSlice(of({
        migrations: this.staticMigrations.sort((a, b) => {
          if (a.date < b.date) {
            return -1;
          }
          if (a.date > b.date) {
            return 1;
          }
          return 0;
        })
      })
    );
  }


  private _parseClientMigrationTimelineReleaseList(list: MigrationReleaseItem[]): ClientMigrationTimelineReleaseItem[] {
    return list.map(release => this._parseClientMigrationTimelineReleaseItem(release));
  }

  private _parseClientMigrationTimelineReleaseItem(r: MigrationReleaseItem): ClientMigrationTimelineReleaseItem {
    return {
      ...r,
      // @TODO create date obj for GMT+0 (or figure out in which timezone RxJS is released...)
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse
      // new Date(var + 'GMT+0')
      date: new Date(r.date),
      version: r.version,
      officialRelease: r.version.split('-').length < 2,
      versionNumber: formatSemVerNumber(r.version),
      deprecations: r.deprecations
        .map(this._parseToMigrationItemUIDAware(r.version)),
      breakingChanges: r.breakingChanges
        .map(this._parseToMigrationItemUIDAware(r.version)),
    };
  }

  private _parseToMigrationItemUIDAware<T>(version: string) {
    return (item) => {
        const awareItem: T & MigrationItemUIDAware = {
          ...item,
          migrationReleaseUID: formatSemVerNumber(version) + '',
          migrationItemSubjectUID: parseMigrationItemSubjectUID(item, {}),
          migrationItemUID: parseMigrationItemUID(item, {version})
        };

        let opponentMigrationItemUID;
        if (item.itemType === 'deprecation') {
          opponentMigrationItemUID = parseMigrationItemUID(item, {
            itemType: 'breakingChange',
            version: item.breakingChangeVersion,
            subjectAction: item.breakingChangeSubjectAction
          });
          // i.itemType === 'breakingChange'
        } else {
          opponentMigrationItemUID = parseMigrationItemUID(item, {
            itemType: 'deprecation',
            version: item.deprecationVersion,
            subjectAction: item.deprecationSubjectAction
          });
        }
        awareItem.opponentMigrationItemUID = opponentMigrationItemUID;
        return awareItem;
    }
  }

}
