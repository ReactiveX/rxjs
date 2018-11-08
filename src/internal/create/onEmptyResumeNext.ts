import { Observable } from 'rxjs/internal/Observable';
import { sourceAsObservable } from 'rxjs/internal/util/sourceAsObservable';
import { FOType, Sink, SinkArg} from 'rxjs/internal/types';
import { Subscription } from 'rxjs/internal/Subscription';
import { RecyclableSubscription } from 'rxjs/internal/RecyclableSubscription';

export function onEmptyResumeNext<T>(...sources: Array<Observable<T>>): Observable<T> {
  return sourceAsObservable((type: FOType.SUBSCRIBE, dest: Sink<T>, downstreamSubs: Subscription) => {
    if (type === FOType.SUBSCRIBE) {
      const remainingSources = sources.slice();
      let hasValue = false;
      const upstreamSubs = new RecyclableSubscription();
      downstreamSubs.add(upstreamSubs);

      let subscribe: () => void;
      subscribe = () => {
        const source = remainingSources.shift();
        hasValue = false;
        source(FOType.SUBSCRIBE, (t: FOType, v: SinkArg<T>, _: Subscription) => {
          hasValue = hasValue || t === FOType.NEXT;
          if (t === FOType.COMPLETE && !hasValue) {
            upstreamSubs.recycle();
            subscribe();
          } else {
            dest(t, v, downstreamSubs);
          }
        }, upstreamSubs);
      };

      subscribe();
    }
  });
}
