import { lift } from 'rxjs/internal/util/lift';
import { Observable } from 'rxjs/internal/Observable';
import { Subscription } from 'rxjs/internal/Subscription';
import { FOType, OperatorFunction, Notification, Sink, SinkArg } from 'rxjs/internal/types';

export function dematerialize<T>() : OperatorFunction<Notification<T>, T> {
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
