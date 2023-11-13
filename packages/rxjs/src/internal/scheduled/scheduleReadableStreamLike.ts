import { SchedulerLike, ReadableStreamLike } from '../types.js';
import { Observable, readableStreamLikeToAsyncGenerator } from '../Observable.js';
import { scheduleAsyncIterable } from './scheduleAsyncIterable.js';

export function scheduleReadableStreamLike<T>(input: ReadableStreamLike<T>, scheduler: SchedulerLike): Observable<T> {
  return scheduleAsyncIterable(readableStreamLikeToAsyncGenerator(input), scheduler);
}
