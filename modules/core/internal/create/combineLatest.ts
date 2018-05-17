import { ObservableInput, FOType, Sink, Source, SinkArg } from "../types";
import { Observable, sourceAsObservable } from "../Observable";
import { Subscription } from "../Subscription";
import { fromSource } from "./from";
import { identity } from '../util/identity';

export function combineLatest<T>(...sources: ObservableInput<T>[]): Observable<T> {
  return sourceAsObservable(combineLatestSource(sources));
}

export function combineLatestSource<T>(sources: ObservableInput<T>[]): Source<T> {
  return (type: FOType, sink: Sink<T>, subs: Subscription) => {
    if (type === FOType.SUBSCRIBE) {
      const values = new Array(sources.length);
      let emittedOnce = sources.map(() => false);
      let hasValues = false;

      for (let s = 0; s < sources.length; s++) {
        const source = sources[s];
        let src: Source<T>;
        try {
          src = fromSource(source);
        } catch (err) {
          sink(FOType.ERROR, err, subs);
          subs.unsubscribe();
          return;
        }

        src(FOType.SUBSCRIBE, (t: FOType, v: SinkArg<T>, subs: Subscription) => {
          if(t === FOType.NEXT) {
            values[s] = v;
            emittedOnce[s] = true;
            if (hasValues || (hasValues = emittedOnce.every(identity))) {
              sink(FOType.NEXT, values.slice(), subs);
            }
          }
        }, subs);
      }
    }
  };
}
