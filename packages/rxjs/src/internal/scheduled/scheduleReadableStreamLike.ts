import type { SchedulerLike, ReadableStreamLike } from '../types.js';
import type { Observable} from '../Observable.js';
import { readableStreamLikeToAsyncGenerator } from '../Observable.js';
import { scheduleAsyncIterable } from './scheduleAsyncIterable.js';

export function scheduleReadableStreamLike<T>(input: ReadableStreamLike<T>, scheduler: SchedulerLike): Observable<T> {
  return scheduleAsyncIterable(readableStreamLikeToAsyncGenerator(input), scheduler);
}
