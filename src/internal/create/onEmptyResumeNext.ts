import { operator } from '../util/operator';
import { Observable, sourceAsObservable } from '../Observable';
import { FOType, Sink, SinkArg, Operation} from '../types';
import { Subscription } from '../Subscription';
import { RecyclableSubscription } from '../RecyclableSubscription';

export function onEmptyResumeNext<T>(...sources: Array<Observable<T>>): Observable<T> {
  return sourceAsObservable((type: FOType.SUBSCRIBE, dest: Sink<T>, downstreamSubs: Subscription) => {
    if (type === FOType.SUBSCRIBE) {
      const remainingSources = sources.slice();
      let empty = true;
      const upstreamSubs = new RecyclableSubscription();
      downstreamSubs.add(upstreamSubs);

      let subscribe: () => void;
      subscribe = () => {
        const source = remainingSources.shift();
        empty = true;
        source(FOType.SUBSCRIBE, (t: FOType, v: SinkArg<T>, _: Subscription) => {
          if (t === FOType.COMPLETE && empty) {
            upstreamSubs.recycle();
            subscribe();
          } else {
            if (t === FOType.NEXT) {
              empty = false;
            }
            dest(t, v, downstreamSubs);
          }
        }, upstreamSubs);
      };

      subscribe();
    }
  });
}

