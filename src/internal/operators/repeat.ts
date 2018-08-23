import { Operation, FOType, Sink, SinkArg } from '../types';
import { sourceAsObservable, Observable } from '../Observable';
import { RecyclableSubscription } from '../RecyclableSubscription';
import { Subscription } from '../Subscription';
import { lift } from '../util/lift';

export function repeat<T>(count: number): Operation<T, T> {
  return lift((source: Observable<T>, dest: Sink<T>, downstreamSubs: Subscription) => {
    let counter = 0;
    const upstreamSubs = new RecyclableSubscription();
    downstreamSubs.add(upstreamSubs);

    let subscribe: () => void;
    subscribe = () => {
      source(FOType.SUBSCRIBE, (t: FOType, v: SinkArg<T>, _: Subscription) => {
        if (t === FOType.COMPLETE) {
          counter++;
          if (counter < count) {
            upstreamSubs.recycle();
            subscribe();
          } else {
            dest(FOType.COMPLETE, undefined, downstreamSubs);
          }
        } else {
          dest(t, v, downstreamSubs);
        }
      }, upstreamSubs);
    };

    subscribe();
  });
}
