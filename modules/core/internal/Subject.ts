import { Observer, FOType, FObsArg, FObs } from './types';
import { Observable, sourceAsObservable } from './Observable';
import { Subscription } from './Subscription';
import { sourceAsSubject, subjectBaseSource } from './util/subjectBase';

export interface Subject<T> extends Observer<T>, Observable<T> {
}

export interface SubjectConstructor {
  new<T>(): Subject<T>;
}

export const Subject: SubjectConstructor = (<T>() => {
  let state: any[];
  let source = subjectSource<T>();
  return sourceAsSubject<T>(source);
}) as any;

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
