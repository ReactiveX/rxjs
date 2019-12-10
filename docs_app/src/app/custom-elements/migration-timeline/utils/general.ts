import {merge, Observable, Subject} from 'rxjs';
import {mergeAll} from 'rxjs/operators';


export function disposeEvent(e: Event) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
}

export function flattener<T>(): {
  changes$: Observable<T>;
  add: (o: Observable<T>) => void;
  next(v: T): void;
} {
  const _subject = new Subject<T>();
  const _subjectHOO = new Subject<Observable<T>>();
  const changes$ = merge(_subject, _subjectHOO.pipe(mergeAll()));
  return {
    add: (o: Observable<T>): void => {
      _subjectHOO.next(o);
    },
    next(v: T): void {
      _subject.next(v);
    },
    changes$
  };
}
