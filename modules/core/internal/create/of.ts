import { FOType, FOArg, FSub, FSubType } from '../types';
import { FObservable, Observable } from '../observable/Observable';

export function fOf<T>(...values: T[]) {
  return (type: FOType, sink: FOArg<T>, subs: FSub) => {
    if (type === FOType.SUBSCRIBE) {
      for (let i = 0; i < values.length && !subs(FSubType.CHECK); i++) {
        sink(FOType.NEXT, values[i], subs);
      }
      sink(FOType.COMPLETE, undefined, subs);
    }
  };
}

export function of<T>(...values: T[]): Observable<T> {
  return new FObservable(fOf(values));
}