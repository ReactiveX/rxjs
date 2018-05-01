import { ObservableInput, FOType, Sink, Source } from "../types";
import { Observable, sourceAsObservable } from "../Observable";
import { Subscription } from "../Subscription";
import { fromSource } from "./from";

export function defer<T>(fn: () => ObservableInput<T>): Observable<T> {
  return sourceAsObservable(deferSource(fn));
}

export function deferSource<T>(fn: () => ObservableInput<T>): Source<T> {
  return (type: FOType, sink: Sink<T>, subs: Subscription) => {
    if (type === FOType.SUBSCRIBE) {
      let result: Source<T>;
      try {
        result = fromSource(fn());
      } catch (err) {
        sink(FOType.ERROR, err, subs);
        subs.unsubscribe();
        return;
      }
      result(FOType.SUBSCRIBE, sink, subs);
    }
  };
}
