import Subject from '../Subject';
import Observer from '../Observer';
import Subscription from '../Subscription';

export default class BehaviorSubject<T> extends Subject<T> {

  constructor(public value:any) {
    super();
  }

  _subscribe(subscriber): Subscription<T> {
    const subscription = super._subscribe(subscriber);
    if (!subscription.isUnsubscribed) {
      subscriber.next(this.value);
    }
    return subscription;
  }

  next(value?) {
    super.next(this.value = value);
  }
}