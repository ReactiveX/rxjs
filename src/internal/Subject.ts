import { Observer, FOType, FObsArg, FObs, Sink, Source } from './types';
import { Observable } from './Observable';
import { Subscription } from './Subscription';
import { sourceAsSubject } from './util/sourceAsSubject';
import { subjectBaseSource } from 'rxjs/internal/sources/subjectBaseSource';
import { sinkFromObserver } from "./util/sinkFromObserver";

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
  let _closed = false;
  let _hasError = false;
  let _error: any;
  return (type: FOType, arg: FObsArg<T>, subs: Subscription) => {
    if (type === FOType.SUBSCRIBE) {
      if (_hasError) {
        arg(FOType.ERROR, _error, subs);
      }
    }

    if (!_closed) {
      if (type === FOType.COMPLETE || type === FOType.ERROR) {
        _closed = true;
        if (type === FOType.ERROR) {
          _hasError = true;
          _error = arg;
        }
      }
      base(type, arg, subs);
    }
  };
}
