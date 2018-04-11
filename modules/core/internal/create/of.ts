import { Observable, sourceAsObservable } from '../Observable';
import { FOType, Sink, Source } from '../types';
import { Subscription } from '../Subscription';

export function of<T>(...values: T[]): Observable<T> {
  return sourceAsObservable(ofSource(values));
}

export function ofSource<T>(values: T[]): Source<T> {
  return (type: FOType, sink: Sink<T>) => {
    if (type === FOType.SUBSCRIBE) {
      let closed = false;
      const subs = new Subscription(() => closed = true);
      sink(FOType.SUBSCRIBE, subs);
      for (const value of values) {
        if (closed) return;
        sink(FOType.NEXT, value);
      }
      if (closed) return;
      sink(FOType.COMPLETE, undefined);
    }
  };
}
