import { Observer, FOType, FObsArg, FObs, Sink, Source } from './types';
import { Observable, sourceAsObservable, sinkFromObserver } from './Observable';
import { Subscription } from './Subscription';
import { sourceAsSubject, subjectBaseSource } from './util/subjectBase';

export interface Subject<T> extends Observer<T>, Observable<T> {
}

export interface SubjectConstructor {
  <T>(): Subject<T>;
  <T>(observer: Observer<T>, observable: Observable<T>): Subject<T>;
  new<T>(): Subject<T>;
}

export const Subject: SubjectConstructor = (<T>(observer?: Observer<T>, observable?: Observable<T>) => {
  return sourceAsSubject(
    observer
    ? frankenSubjectSource(
      sinkFromObserver(observer),
      observable,
    )
    : subjectSource<T>()
  )
}) as any;

export function frankenSubjectSource<T>(
  sink: Sink<T>,
  source: Source<T>
) {
  return (type: FOType, arg: FObsArg<T>, subs: Subscription) => {
    if (type === FOType.SUBSCRIBE) {
      source(type, arg, subs);
    } else {
      sink(type, arg, subs);
    }
  };
}

export function subjectSource<T>(): FObs<T> {
  const base = subjectBaseSource<T>();
  let closed = false;
  let hasError = false;
  let error: any;
  return (type: FOType, arg: FObsArg<T>, subs: Subscription) => {
    if (type === FOType.SUBSCRIBE) {
      if (hasError) {
        arg(FOType.ERROR, error, subs);
      }
    }

    if (!closed) {
      if (type === FOType.COMPLETE || type === FOType.ERROR) {
        closed = true;
        if (type === FOType.ERROR) {
          hasError = true;
          error = arg;
        }
      }
      base(type, arg, subs);
    }
  };
}
