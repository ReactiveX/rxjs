import { ObservableInput, FOType, Sink, Source, SinkArg } from '../types';
import { Observable } from '../Observable';
import { sourceAsObservable } from '../util/sourceAsObservable';
import { Subscription } from '../Subscription';
import { fromSource } from "../sources/fromSource";
import { tryUserFunction, resultIsError } from '../util/userFunction';

export function race<T>(...sources: ObservableInput<T>[]): Observable<T> {
  return sourceAsObservable(raceSource(sources));
}

export function raceSource<T>(sources: ObservableInput<T>[]): Source<T> {
  return (type: FOType, sink: Sink<T>, subs: Subscription) => {
    if (type === FOType.SUBSCRIBE) {
      let allSubs: Subscription[] = [];
      for (let s = 0; s < sources.length; s++) {
        const source = sources[s];
        const src = tryUserFunction(fromSource, source);
        if (resultIsError(src)) {
          sink(FOType.ERROR, src.error, subs);
          subs.unsubscribe();
          return;
        }

        const mySubs = new Subscription();
        subs.add(mySubs);
        allSubs.push(mySubs);
        src(FOType.SUBSCRIBE, (t: FOType, v: SinkArg<T>, mySubs: Subscription) => {
          if (allSubs && t === FOType.NEXT) {
            for (let childSubs of allSubs) {
              if (childSubs !== mySubs) childSubs.unsubscribe();
            }
            allSubs = null;
          }
          sink(t, v, subs);
        }, mySubs);
      }
    }
  };
}
