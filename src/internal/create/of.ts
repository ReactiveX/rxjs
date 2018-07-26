import { Observable, sourceAsObservable } from '../Observable';
import { FOType, Sink, Source } from 'rxjs/internal/types';
import { Subscription } from 'rxjs/internal/Subscription';

export function of<T>(...values: T[]): Observable<T> {
  return sourceAsObservable(ofSource(values));
}

export function ofSource<T>(values: ArrayLike<T>): Source<T> {
  return (type: FOType, sink: Sink<T>, subs: Subscription) => {
    if (type === FOType.SUBSCRIBE) {
      for (let i = 0; i < values.length && !subs.closed; i++) {
        if (subs.closed) return;
        sink(FOType.NEXT, values[i], subs);
      }
      if (!subs.closed) sink(FOType.COMPLETE, undefined, subs);
    }
  };
}
