import { Observable } from 'rxjs/internal/Observable';
import { OperatorFunction, NotificationLike, NotificationKind } from 'rxjs/internal/types';
import { MutableSubscriber } from 'rxjs/internal/MutableSubscriber';

export function dematerialize<T>(): OperatorFunction<NotificationLike<T>, T> {
  return (source: Observable<NotificationLike<T>>) => source.lift(dematerializeLifted);
}

function dematerializeLifted<T>(this: MutableSubscriber<any>, source: Observable<T>) {
  const mut = this;
  const _next = mut.next;
  mut.next = (notification: NotificationLike<T>) => {
    switch (notification.kind) {
      case NotificationKind.NEXT:
        _next(notification.value);
        break;
      case NotificationKind.COMPLETE:
        mut.complete();
        break;
      case NotificationKind.ERROR:
        mut.error(notification.error);
        break;
      default:
        throw new Error(`unhandled notification type ${notification.kind}`);
    }
  };
  return source.subscribe(mut);
}
