import {Observable} from 'rxjs';
import {map, switchMap, tap} from 'rxjs/operators';
import {ClientRelease} from '../data-access/migration-timeline.service';
import {ClientMigrationRelease} from '../migration-timeline.interface';
import {getClosestVersion, getLatestVersion} from './filter';

export const disposeEvent = (o$) => o$.pipe(
  tap((e: Event) => {
    e.preventDefault();
    e.stopPropagation();
  })
);

export const closestRelevantVersion = (list$: Observable<ClientMigrationRelease[]>) =>
  (version$: Observable<string>): Observable<string> => version$
    .pipe(
      switchMap((hash) => {
        const [version] = hash.split('_');
        return list$.pipe(
          map(getClosestVersion(version))
        );
      })
    );
export const closestRelevantMigrationItem = (list$: Observable<ClientMigrationRelease[]>) =>
  (version$: Observable<string>): Observable<string> => version$
    .pipe(
      switchMap((hash) => {
        const [version] = hash.split('_');
        return list$.pipe(
          map(getClosestMigrationItem(version))
        );
      })
    );

export const latestRelevantVersion = (list$: Observable<ClientRelease[]>) => (date$: Observable<Date>): Observable<string> => date$
  .pipe(
    switchMap(date => list$.pipe(
      map(getLatestVersion(date))
    ))
  );



