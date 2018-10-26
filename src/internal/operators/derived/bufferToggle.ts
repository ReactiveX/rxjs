import { Observable } from '../../Observable';
import { Operation } from '../../types';
import { pipe } from '../../util/pipe';
import { mergeMap } from '../mergeMap';
import { toArray } from './toArray';
import { windowToggle } from '../windowToggle';

export function bufferToggle<T, O>(
  openings: Observable<O>,
  closingSelector: (openValue: O) => Observable<any>
): Operation<T, T[]> {
  return pipe(
    windowToggle(openings, closingSelector),
    mergeMap(toArray()),
  );
}