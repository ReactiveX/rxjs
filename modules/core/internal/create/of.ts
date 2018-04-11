import { Observable, sourceAsObservable } from '../Observable';
import { FOType, Sink, Source } from '../types';
import { createSubs } from '../Subscription';

export function of<T>(...values: T[]): Observable<T> {
  return sourceAsObservable(ofSource(values));
}

export function ofSource<T>(values: T[]): Source<T> {
  return (type: FOType, sink: Sink<T>) => {
    let closed = false;
    const subs = createSubs(() => closed = true);
    sink(FOType.SUBSCRIBE, subs);
    for (let value of values) {
      if (closed) { break; }
      sink(FOType.NEXT, value);
    }
    sink(FOType.COMPLETE, undefined);
  };
}
