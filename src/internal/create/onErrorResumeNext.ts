import { Observable } from 'rxjs/internal/Observable';
import { sourceAsObservable } from 'rxjs/internal/util/sourceAsObservable';
import { FOType, Sink, SinkArg} from 'rxjs/internal/types';
import { Subscription } from 'rxjs/internal/Subscription';
import { RecyclableSubscription } from 'rxjs/internal/RecyclableSubscription';

export function onErrorResumeNext<T>(...sources: Array<Observable<T>>): Observable<T> {
  return sourceAsObservable((type: FOType.SUBSCRIBE, dest: Sink<T>, downstreamSubs: Subscription) => {
    const remainingSources = sources.slice();
    const upstreamSubs = new RecyclableSubscription();
    downstreamSubs.add(upstreamSubs);

    let subscribe: () => void;
    subscribe = () => {
      const source = remainingSources.shift();
      source(FOType.SUBSCRIBE, (t: FOType, v: SinkArg<T>, _: Subscription) => {
        if (t === FOType.ERROR && remainingSources.length > 0) {
          upstreamSubs.recycle();
          subscribe();
        } else {
          dest(t, v, downstreamSubs);
        }
      }, upstreamSubs);
    };

    subscribe();
  });
}

