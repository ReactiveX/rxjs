import { lift } from '../util/lift';
import { Observable } from '../Observable';
import { Subscription } from '../Subscription';
import { FOType, Operation, Notification, Sink, SinkArg } from '../types';

export function dematerialize<T>() : Operation<Notification<T>, T> {
  return lift((source: Observable<Notification<T>>, dest: Sink<T>, subs: Subscription) => {
    source(FOType.SUBSCRIBE, (t: FOType, v: SinkArg<Notification<T>>, subs: Subscription) => {
      if (t === FOType.NEXT) {
        const notification = v as Notification<T>;
        switch (notification.kind) {
          case 'N':
            dest(FOType.NEXT, notification.value, subs);
            break;
          case 'C':
            dest(FOType.COMPLETE, undefined, subs);
            subs.unsubscribe();
            break;
          case 'E':
            dest(FOType.ERROR, notification.error, subs);
            subs.unsubscribe();
            break;
          default:
            throw new Error(`unhandled notification type ${notification.kind}`);
        }
      } else {
        dest(t, v, subs);
      }
    }, subs);
  });
}
