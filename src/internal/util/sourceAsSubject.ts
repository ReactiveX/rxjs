import { FOType, FObsArg } from 'rxjs/internal/types';
import { Subscription } from 'rxjs/internal/Subscription';
import { sourceAsObservable } from 'rxjs/internal/util/sourceAsObservable';
import { Subject } from 'rxjs/internal/Subject';

export function sourceAsSubject<T>(source: any): Subject<T> {
  source = sourceAsObservable(source) as Subject<T>;
  source.next = next;
  source.error = error;
  source.complete = complete;
  source.unsubscribe = unsubscribe;
  source.asObservable = asObservable;
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

function unsubscribe<T>(this: Subject<T>) {
  this(FOType.DISPOSE, undefined, undefined);
}

function asObservable<T>(this: Subject<T>) {
  return sourceAsObservable((t: FOType, v: FObsArg<T>, subs: Subscription) => {
    this(t, v, subs);
  });
}
