import { Observable } from 'rxjs/internal/Observable';
import { sourceAsObservable } from 'rxjs/internal/util/sourceAsObservable';
import { FOType, Sink, SinkArg, ObservableInput} from 'rxjs/internal/types';
import { Subscription } from 'rxjs/internal/Subscription';
import { RecyclableSubscription } from 'rxjs/internal/RecyclableSubscription';
import { tryUserFunction, resultIsError } from '../util/userFunction';
import { fromSource } from '../sources/fromSource';

export function onErrorResumeNext<T>(...sources: ObservableInput<T>[]): Observable<T> {
  if (sources.length === 1 && Array.isArray(sources[0])) {
    return onErrorResumeNext(...(sources[0] as any[]));
  }
  return sourceAsObservable((type: FOType.SUBSCRIBE, dest: Sink<T>, downstreamSubs: Subscription) => {
    const remainingSources = sources.slice();
    const upstreamSubs = new RecyclableSubscription();
    downstreamSubs.add(upstreamSubs);

    let subscribe: () => void;
    subscribe = () => {
      const input = remainingSources.shift();
      const source = tryUserFunction(fromSource, input);
      if (resultIsError(source)) {
        upstreamSubs.recycle();
        subscribe();
        return;
      }
      source(FOType.SUBSCRIBE, (t: FOType, v: SinkArg<T>, _: Subscription) => {
        if (t === FOType.ERROR && remainingSources.length > 0) {
          upstreamSubs.recycle();
          subscribe();
        } else {
          if (t === FOType.ERROR) {
            t = FOType.COMPLETE;
          }
          dest(t, v, downstreamSubs);
        }
      }, upstreamSubs);
    };

    subscribe();
  });
}

