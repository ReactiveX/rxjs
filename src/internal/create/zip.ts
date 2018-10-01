import { Observable } from '../Observable';
import { sourceAsObservable } from '../util/sourceAsObservable';
import { ObservableInput, Source, FOType, Sink, SinkArg } from '../types';
import { Subscription } from '../Subscription';
import { fromSource } from "../sources/fromSource";
import { identity } from '../util/identity';
import { tryUserFunction, resultIsError } from '../util/userFunction';

export function zip<T>(...sources: ObservableInput<T>[]): Observable<T> {
  return sourceAsObservable(zipSource(sources));
}

function zipSource<T>(sources: ObservableInput<T>[]): Source<T> {
  return (type: FOType.SUBSCRIBE, sink: Sink<T>, subs: Subscription) => {
    if (type === FOType.SUBSCRIBE) {
      let buffers: T[][] = sources.map(() => []);
      let complete: boolean[] = sources.map(() => false);

      for (let s = 0; s < sources.length; s++) {
        const source = sources[s];
        const src = tryUserFunction(fromSource, source);
        if (resultIsError(src)) {
          sink(FOType.ERROR, src.error, subs);
          return;
        }

        src(FOType.SUBSCRIBE, (t: FOType, v: SinkArg<T>, subs: Subscription) => {
          switch (t) {
            case FOType.NEXT:
              buffers[s].push(v);
              while (buffers.every(b => b.length > 0)) {
                sink(FOType.NEXT, buffers.map(b => b.shift(), subs), subs);
              }
              break;
            case FOType.ERROR:
              sink(t, v, subs);
              break;
            case FOType.COMPLETE:
              complete[s] = true;
              if (complete.every(identity)) {
                buffers = null;
                sink(t, v, subs);
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
