import { Observable } from './Observable';
import { sourceAsObservable } from './util/sourceAsObservable';
import { subjectBaseSource } from './sources/subjectBaseSource';
import { FObs, FOType } from './types';

export interface EventEmitter<T> extends Observable<T> {
  emit(value: T): void;
  next(value: T): void;
}

export interface EventEmitterCtor {
  new<T>(): EventEmitter<T>;
}

/**
 * A Subject type that will never error or complete. It's made
 * to pump values through to many consumers.
 */
export const EventEmitter: EventEmitterCtor = (() => {
  let result = subjectBaseSource<any>();
  result = sourceAsObservable(result);
  (result as EventEmitter<any>).next = next;
  (result as EventEmitter<any>).emit = next;
  return result;
}) as any;

function next<T>(this: FObs<T>, value: T) {
  // Since subscription is not threaded through multicast during next,
  // we don't need to pass anything here.
  this(FOType.NEXT, value, undefined);
}
