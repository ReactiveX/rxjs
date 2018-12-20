import { Observable } from 'rxjs/internal/Observable';
import { Subscription } from 'rxjs/internal/Subscription';
import { OperatorFunction, NotificationLike } from 'rxjs/internal/types';
import { Subscriber } from '../Subscriber';
import { OperatorSubscriber } from '../OperatorSubscriber';

export function dematerialize<T>(): OperatorFunction<NotificationLike<T>, T> {
  return (source: Observable<NotificationLike<T>>) => source.lift(dematerializeOperator());
}

function dematerializeOperator<T>() {
  return function dematerializeLift(this: Subscriber<T>, source: Observable<NotificationLike<T>>, subscription: Subscription) {
    return source.subscribe(new DematerializeSubscriber(subscription, this), subscription);
  };
}

class DematerializeSubscriber<T> extends OperatorSubscriber<NotificationLike<T>> {
  next(notification: NotificationLike<T>) {
    const { _destination } = this;
    switch (notification.kind) {
      case 'N':
        _destination.next(notification.value);
        break;
      case 'C':
        _destination.complete();
        break;
      case 'E':
        _destination.error(notification.error);
        break;
      default:
        throw new Error(`unhandled notification type ${notification.kind}`);
    }
  }
}
