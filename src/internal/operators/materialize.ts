import { Operation, FOType, Sink, SinkArg, Notification } from '../types';
import { sourceAsObservable, Observable } from '../Observable';
import { Subscription } from '../Subscription';

export function materialize<T>(includeSubscriptionNotifications = false): Operation<T, Notification<T>> {
  return (source: Observable<T>) =>
    sourceAsObservable((type: FOType.SUBSCRIBE, dest: Sink<Notification<T>>, subs: Subscription) => {
      if (type === FOType.SUBSCRIBE) {
        if (includeSubscriptionNotifications) {
          subs.add(() => dest(FOType.NEXT, { kind: 'U' }, subs));
          dest(FOType.NEXT, { kind: 'S' }, subs);
        }
        source(FOType.SUBSCRIBE, (t: FOType, v: SinkArg<T>, subs: Subscription) => {
          switch (t) {
            case FOType.NEXT:
              dest(FOType.NEXT, { kind: 'N', value: v }, subs);
              break;
            case FOType.ERROR:
              dest(FOType.NEXT, { kind: 'E', error: v }, subs);
              dest(FOType.COMPLETE, undefined, subs);
              break;
            case FOType.COMPLETE:
              dest(FOType.NEXT, { kind: 'C' }, subs);
              dest(FOType.COMPLETE, undefined, subs);
              break;
          }
        }, subs);
      }
    });
  }
