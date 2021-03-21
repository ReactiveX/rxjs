import { SchedulerLike } from '../types';
import { Observable } from '../Observable';
import { scheduleAsyncIterable } from './scheduleAsyncIterable';
import { ReadableStreamLike, readableStreamLikeToAsyncGenerator } from '../util/isReadableStreamLike';

export function scheduleReadableStreamLike<T>(input: ReadableStreamLike<T>, scheduler: SchedulerLike): Observable<T> {
  return scheduleAsyncIterable(readableStreamLikeToAsyncGenerator(input), scheduler);
}
