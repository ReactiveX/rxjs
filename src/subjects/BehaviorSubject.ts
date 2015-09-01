import Subject from '../Subject';
import SubjectSubscription from './SubjectSubscription';
import Observer from '../Observer';
import Subscription from '../Subscription';

export default class BehaviorSubject<T> extends Subject<T> {
  constructor(public value:any) {
    super();
  }

  _subscribe(subscriber) {
    const subscription = super._subscribe(subscriber);
    if (!subscription) {
      return;
    } else if (!subscription.isUnsubscribed) {
      subscriber.next(this.value);
    }
    return subscription;
  }

  _next(value?) {
    super._next(this.value = value);
  }
}