import {Observable} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';
import {ClientRelease} from '../data-access/migration-timeline.service';
import {VmReleaseListItem} from '../migration-timeline.interface';
import {getClosestVersion, getLatestVersion} from './filter';

export const closestRelevantVersion = (list$: Observable<VmReleaseListItem[]>) =>
  (version$: Observable<string>): Observable<string> => version$
    .pipe(
      switchMap((hash) => {
        const [version] = hash.split('_');
        return list$.pipe(
          map(getClosestVersion(version))
        );
      })
    );

export const latestRelevantVersion = (list$: Observable<ClientRelease[]>) => (date$: Observable<Date>): Observable<string> => date$
  .pipe(
    switchMap(date => list$.pipe(
      map(getLatestVersion(date))
    ))
  );



