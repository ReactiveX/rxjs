import { windowTime } from './windowTime';
import { Operation, SchedulerLike } from '../../types';
import { pipe } from '../../util/pipe';
import { mergeMap } from '../mergeMap';
import { toArray } from './toArray';

export function bufferTime<T>(bufferTimeSpan: number, scheduler?: SchedulerLike): Operation<T, T[]>;

export function bufferTime<T>(
  bufferTimeSpan: number,
  bufferCreationInterval: number,
  scheduler?: SchedulerLike
): Operation<T, T[]>;

export function bufferTime<T>(
  bufferTimeSpan: number,
  bufferCreationInterval: number,
  maxBufferSize: number,
  scheduler?: SchedulerLike
): Operation<T, T[]>;

export function bufferTime<T>(...args: any[]): Operation<T, T[]> {
  return pipe(
    windowTime.apply(undefined, args),
    mergeMap(toArray()),
  );
}