import { SchedulerLike, ReadableStreamLike } from '../types';
import { Observable } from '../Observable.js';
import { scheduleAsyncIterable } from './scheduleAsyncIterable.js';
import { readableStreamLikeToAsyncGenerator } from '../util/isReadableStreamLike.js';

export function scheduleReadableStreamLike<T>(input: ReadableStreamLike<T>, scheduler: SchedulerLike): Observable<T> {
  return scheduleAsyncIterable(readableStreamLikeToAsyncGenerator(input), scheduler);
}
