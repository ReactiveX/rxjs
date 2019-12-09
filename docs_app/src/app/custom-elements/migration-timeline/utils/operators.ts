import {Observable} from 'rxjs';
import {map, switchMap, tap} from 'rxjs/operators';
import {ClientMigrationTimelineReleaseItem} from '../data-access/migration-timeline.interface';
import {getClosestVersion, getLatestVersion} from './filter';

export const disposeEvent = (o$) => o$.pipe(
  tap((e: Event) => {
    e.preventDefault();
    e.stopPropagation();
  })
);

export const closestRelevantVersion = (list$: Observable<ClientMigrationTimelineReleaseItem[]>) =>
  (version$: Observable<string>): Observable<string> => version$
    .pipe(
      switchMap((hash) => {
        const [version] = hash.split('_');
        return list$.pipe(
          map(getClosestVersion(version))
        );
      })
    );

export const latestRelevantVersion = (list$: Observable<ClientMigrationTimelineReleaseItem[]>) =>
  (date$: Observable<Date>): Observable<string> => date$
  .pipe(
    switchMap(date => list$.pipe(
      map(getLatestVersion(date))
    ))
  );



