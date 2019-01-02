import { Observable } from 'rxjs/internal/Observable';
import { Subscription } from 'rxjs/internal/Subscription';
import { OperatorFunction, NotificationLike } from 'rxjs/internal/types';
import { Subscriber } from '../Subscriber';
import { OperatorSubscriber } from '../OperatorSubscriber';

export function dematerialize<T>(): OperatorFunction<NotificationLike<T>, T> {
  return (source: Observable<NotificationLike<T>>) => new Observable(subscriber => source.subscribe(new DematerializeSubscriber(subscriber)));
}

class DematerializeSubscriber<T> extends OperatorSubscriber<NotificationLike<T>> {
  _next(notification: NotificationLike<T>) {
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
