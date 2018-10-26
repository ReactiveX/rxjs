import { windowCount } from '../windowCount';
import { Operation } from '../../types';
import { pipe } from '../../util/pipe';
import { mergeMap } from '../mergeMap';
import { toArray } from './toArray';

export function bufferCount<T>(
  bufferSize: number,
  startBufferEvery: number = 0,
): Operation<T, T[]> {
  return pipe(
    windowCount(bufferSize, startBufferEvery),
    mergeMap(toArray()),
  );
}