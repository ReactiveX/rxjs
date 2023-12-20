import type { SchedulerLike, ReadableStreamLike } from '../types.js';
import type { Observable } from '@rxjs/observable';
import { readableStreamLikeToAsyncGenerator } from '@rxjs/observable/internal/utils.js';
import { scheduleAsyncIterable } from './scheduleAsyncIterable.js';

export function scheduleReadableStreamLike<T>(input: ReadableStreamLike<T>, scheduler: SchedulerLike): Observable<T> {
  return scheduleAsyncIterable(readableStreamLikeToAsyncGenerator(input), scheduler);
}
