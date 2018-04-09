import { Observable, FObservable } from '../observable/Observable';
import { FOType, FOArg, FSub, ObservableInput } from '../types';
import { fFrom } from './from';

export function merge<T>(...sources: Array<ObservableInput<T>>): Observable<T> {
  const fObses = sources.map(source => fFrom(source));
  return new FObservable((type: FOType, sink: FOArg<T>, subs: FSub) => {
    if (type === FOType.SUBSCRIBE) {
      for (const fobs of fObses) {
        fobs(type, sink, subs);
      }
    }
  });
}
