import { Observable } from 'rxjs/internal/Observable';
import { OperatorFunction } from 'rxjs/internal/types';
import { pipe } from 'rxjs/internal/util/pipe';
import { mergeMap } from 'rxjs/internal/operators/mergeMap';
import { toArray } from 'rxjs/internal/operators/derived/toArray';
import { windowToggle } from 'rxjs/internal/operators/windowToggle';

export function bufferToggle<T, O>(
  openings: Observable<O>,
  closingSelector: (openValue: O) => Observable<any>
): OperatorFunction<T, T[]> {
  return pipe(
    windowToggle(openings, closingSelector),
    mergeMap(toArray()),
  );
}
