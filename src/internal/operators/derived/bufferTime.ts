import { windowTime } from 'rxjs/internal/operators/derived/windowTime';
import { OperatorFunction, SchedulerLike } from 'rxjs/internal/types';
import { pipe } from 'rxjs/internal/util/pipe';
import { mergeMap } from 'rxjs/internal/operators/mergeMap';
import { toArray } from 'rxjs/internal/operators/derived/toArray';

export function bufferTime<T>(bufferTimeSpan: number, scheduler?: SchedulerLike): OperatorFunction<T, T[]>;

export function bufferTime<T>(
  bufferTimeSpan: number,
  bufferCreationInterval: number,
  scheduler?: SchedulerLike
): OperatorFunction<T, T[]>;

export function bufferTime<T>(
  bufferTimeSpan: number,
  bufferCreationInterval: number,
  maxBufferSize: number,
  scheduler?: SchedulerLike
): OperatorFunction<T, T[]>;

export function bufferTime<T>(...args: any[]): OperatorFunction<T, T[]> {
  return pipe(
    windowTime.apply(undefined, args),
    mergeMap(toArray()),
  );
}
