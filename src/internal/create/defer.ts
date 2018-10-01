import { ObservableInput, FOType, Sink, Source } from '../types';
import { Observable } from '../Observable';
import { sourceAsObservable } from '../util/sourceAsObservable';
import { Subscription } from '../Subscription';
import { fromSource } from "../sources/fromSource";
import { tryUserFunction, resultIsError } from '../util/userFunction';

export function defer<T>(fn: () => ObservableInput<T>): Observable<T> {
  return sourceAsObservable(deferSource(fn));
}

export function deferSource<T>(fn: () => ObservableInput<T>): Source<T> {
  return (type: FOType, sink: Sink<T>, subs: Subscription) => {
    if (type === FOType.SUBSCRIBE) {
      const result = tryUserFunction(() => fromSource(fn()));
      if (resultIsError(result)) {
        sink(FOType.ERROR, result.error, subs);
        return;
      }
      result(FOType.SUBSCRIBE, sink, subs);
    }
  };
}
