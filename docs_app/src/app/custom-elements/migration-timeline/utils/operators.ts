import {Observable} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';
import {Release} from '../data-access/interfaces';
import {getClosestRelevantVersion, getLatestRelevantVersion} from './vm-model.parser';

export const closestRelevantVersion = (list$: Observable<Release[]>) => (version$: Observable<string>): Observable<string> => version$
  .pipe(
    switchMap((version) => list$.pipe(
      map(getClosestRelevantVersion(version))
    ))
  );

export const latestRelevantVersion = (list$: Observable<Release[]>) => (date$: Observable<Date>): Observable<string> => date$
  .pipe(
    switchMap(date => list$.pipe(
      map(getLatestRelevantVersion(date))
    ))
  );

