import { Operation, FOType, Sink, SinkArg } from '../types';
import { Observable } from '../Observable';
import { sourceAsObservable } from '../util/sourceAsObservable';
import { RecyclableSubscription } from '../RecyclableSubscription';
import { Subscription } from '../Subscription';
import { lift } from '../util/lift';
import { subjectSource } from '../Subject';
import { tryUserFunction, resultIsError } from '../util/userFunction';
import { fromSource } from '../create/from';

export function repeatWhen<T>(notifierSetup: (completions: Observable<any>) => Observable<any>): Operation<T, T> {
  return lift((source: Observable<T>, dest: Sink<T>, downstreamSubs: Subscription) => {
    const upstreamSubs = new RecyclableSubscription();
    downstreamSubs.add(upstreamSubs);
    const completions = subjectSource();
    const notifier = tryUserFunction((completions) => fromSource(notifierSetup(completions)), sourceAsObservable(completions));

    if (resultIsError(notifier)) {
      dest(FOType.ERROR, notifier.error, downstreamSubs);
      return;
    }

    let subscribe: () => void;
    subscribe = () => {
      source(FOType.SUBSCRIBE, (t: FOType, v: SinkArg<T>, _: Subscription) => {
        if (t === FOType.COMPLETE) {
          completions(FOType.NEXT, undefined, downstreamSubs);
        } else {
          dest(t, v, downstreamSubs);
        }
      }, upstreamSubs);
    };

    notifier(FOType.SUBSCRIBE, (t: FOType, v: SinkArg<any>, downstreamSubs: Subscription) => {
      if (t === FOType.NEXT) {
        upstreamSubs.recycle();
        subscribe();
      } else  {
        dest(t, v, downstreamSubs);
      }

    }, downstreamSubs);

    subscribe();
  });
}
