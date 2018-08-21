import { ObservableInput, FOType, Sink, Source, SinkArg } from '../types';
import { Observable } from '../Observable';
import { sourceAsObservable } from '../util/sourceAsObservable';
import { Subscription } from '../Subscription';
import { fromSource } from "rxjs/internal/sources/fromSource";
import { identity } from '../util/identity';
import { tryUserFunction, resultIsError } from '../util/userFunction';

export function combineLatest<T>(...sources: ObservableInput<T>[]): Observable<T> {
  return sourceAsObservable(combineLatestSource(sources));
}

export function combineLatestSource<T>(sources: ObservableInput<T>[]): Source<T> {
  return (type: FOType, dest: Sink<T>, subs: Subscription) => {
    if (type === FOType.SUBSCRIBE) {
      const values = new Array(sources.length);
      let emittedOnce = sources.map(() => false);
      let completed = sources.map(() => false);
      let hasValues = false;

      for (let s = 0; s < sources.length; s++) {
        const source = sources[s];
        const src = tryUserFunction(fromSource, source);
        if (resultIsError(src)) {
          dest(FOType.ERROR, src.error, subs);
          subs.unsubscribe();
          return;
        }

        src(FOType.SUBSCRIBE, (t: FOType, v: SinkArg<T>, subs: Subscription) => {
          switch (t) {
            case FOType.NEXT:
              values[s] = v;
              emittedOnce[s] = true;
              if (hasValues || (hasValues = emittedOnce.every(identity))) {
                dest(FOType.NEXT, values.slice(0), subs);
              }
              break;
            case FOType.ERROR:
              dest(t, v, subs);
              subs.unsubscribe();
              break;
            case FOType.COMPLETE:
              completed[s] = true;
              if (completed.every(identity)) {
                dest(FOType.COMPLETE, undefined, subs)
                subs.unsubscribe();
              }
              break;
            default:
              break;
          }
        }, subs);
      }
    }
  };
}
