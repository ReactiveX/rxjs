import {merge, Observable, Subject} from 'rxjs';
import {mergeAll} from 'rxjs/operators';

export function comparePropertyFactory<T, U>(
  orderAsc = true,
  getProp: (i: T) => U,
  formatter: (v: U) => string | number | boolean = (i) => i + ''
) {
  return (a, b) => {
    const propA = getProp(a);
    const propB = getProp(b);
    if (propA === undefined || propB === undefined) {
      // property doesn't exist on either object
      return 0;
    }

    const varA = formatter(propA);
    const varB = formatter(propB);

    let comparison = 0;
    if (varA > varB) {
      comparison = 1;
    } else if (varA < varB) {
      comparison = -1;
    }
    return (
      (orderAsc === false) ? (comparison * -1) : comparison
    );
  };
}

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
