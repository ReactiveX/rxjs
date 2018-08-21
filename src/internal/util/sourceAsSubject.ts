import { FOType } from '../types';
import { Subscription } from '../Subscription';
import { sourceAsObservable } from './sourceAsObservable';
import { Subject } from '../Subject';

export function sourceAsSubject<T>(source: any): Subject<T> {
  source = sourceAsObservable(source) as Subject<T>;
  source.next = next;
  source.error = error;
  source.complete = complete;
  return source;
}

function next<T>(this: Subject<T>, value: T, subs: Subscription) {
  this(FOType.NEXT, value, subs);
}

// NOTE: For error and complete, subscription doesn't matter, as
// we are passing it from state

function error<T>(this: Subject<T>, err: any) {
  this(FOType.ERROR, err, undefined);
}

function complete<T>(this: Subject<T>) {
  this(FOType.COMPLETE, undefined, undefined);
}
