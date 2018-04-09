import { ObservableInput, FOType, FOArg, FSub, FObs } from '../types';
import { Observable, FObservable } from '../observable/Observable';
import { fFrom } from './from';

export function defer<T>(factory: () => ObservableInput<T>): Observable<T> {
  return new FObservable((type: FOType, sink: FOArg<T>, subs: FSub) => {
    if (type === FOType.SUBSCRIBE) {
      let result: FObs<T>;
      try {
        result = fFrom(factory());
      } catch (err) {
        sink(FOType.ERROR, err, subs);
        return;
      }
      result(type, sink, subs);
    }
  });
}
