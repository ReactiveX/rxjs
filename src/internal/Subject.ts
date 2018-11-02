import { Observer, FOType, FObsArg, FObs, Sink, Source } from 'rxjs/internal/types';
import { Observable } from 'rxjs/internal/Observable';
import { Subscription } from 'rxjs/internal/Subscription';
import { sourceAsSubject } from 'rxjs/internal/util/sourceAsSubject';
import { subjectBaseSource } from 'rxjs/internal/sources/subjectBaseSource';
import { sinkFromObserver } from "rxjs/internal/util/sinkFromObserver";

export interface Subject<T> extends Observer<T>, Observable<T> {
  unsubscribe(): void;
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
  let _completed = false;
  let _hasError = false;
  let _error: any;
  return (type: FOType, arg: FObsArg<T>, subs: Subscription) => {
    if (type === FOType.SUBSCRIBE) {
      if (_completed) {
        arg(FOType.COMPLETE, undefined, subs);
      } else if (_hasError) {
        arg(FOType.ERROR, _error, subs);
      }
    }

    if (!_completed && !_hasError) {
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
