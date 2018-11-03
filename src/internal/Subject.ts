import { Observer, FOType, FObsArg, FObs, Sink, Source } from 'rxjs/internal/types';
import { Observable } from 'rxjs/internal/Observable';
import { Subscription } from 'rxjs/internal/Subscription';
import { sourceAsSubject } from 'rxjs/internal/util/sourceAsSubject';
import { subjectBaseSource } from 'rxjs/internal/sources/subjectBaseSource';
import { sinkFromObserver } from "rxjs/internal/util/sinkFromObserver";
import { isPartialObserver } from './util/isPartialObserver';

export interface Subject<O, I=O> extends Observer<I>, Observable<O> {
  unsubscribe(): void;
  asObservable(): Observable<O>;
}

export interface SubjectConstructor {
  <T>(): Subject<T>;
  <O, I>(observer: Observer<I>, observable: Observable<O>): Subject<O, I>;
  new<T>(): Subject<T>;
}

export const Subject: SubjectConstructor =  (function Subject<T>(observer?: Observer<T>, observable?: Observable<T>) {
  return sourceAsSubject(
    arguments.length > 0
    ? frankenSubjectSource(
      sinkFromObserver(observer),
      observable,
    )
    : subjectSource<T>()
  )
}) as any;

export function frankenSubjectSource<O, I>(
  sink: Sink<I>,
  source: Source<O>
) {
  return (type: FOType, arg: FObsArg<O|I>, subs: Subscription) => {
    if (type === FOType.SUBSCRIBE) {
      source(type, arg, subs);
    } else {
      sink(type, arg, subs);
    }
  };
}

export function subjectSource<T>(): FObs<T> {
  const base = subjectBaseSource<T>();
  let _completed = false;
  let _hasError = false;
  let _error: any;
  let _disposed = false;

  return (type: FOType, arg: FObsArg<T>, subs: Subscription) => {
    if (type === FOType.DISPOSE) {
      _disposed = true;
    }

    if (type === FOType.SUBSCRIBE) {
      if (_completed) {
        arg(FOType.COMPLETE, undefined, subs);
      } else if (_hasError) {
        arg(FOType.ERROR, _error, subs);
      }
    }

    if (_disposed || (!_completed && !_hasError)) {
      if (type === FOType.COMPLETE) {
        _completed = true;
      } else if (type === FOType.ERROR) {
        _hasError = true;
        _error = arg;
      }
      base(type, arg, subs);
    }
  };
}
