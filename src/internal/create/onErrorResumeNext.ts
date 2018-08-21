import { Observable } from '../Observable';
import { sourceAsObservable } from '../util/sourceAsObservable';
import { FOType, Sink, SinkArg} from '../types';
import { Subscription } from '../Subscription';
import { RecyclableSubscription } from '../RecyclableSubscription';

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

