import Subject from '../Subject';
import Subscription from '../Subscription';
import Observer from '../Observer';

export default class SubjectSubscription<T> extends Subscription<T> {
  isUnsubscribed: boolean = false;

  constructor(public subject: Subject<T>, public observer: Observer<any>) {
    super();
  }

  unsubscribe() {
    if (this.isUnsubscribed) {
      return;
    }

    this.isUnsubscribed = true;

    const subject = this.subject;
    const observers = subject.observers;

    this.subject = void 0;

    if (!observers || observers.length === 0 || subject.isUnsubscribed) {
      return;
    }

    const subscriberIndex = observers.indexOf(this.observer);

    if (subscriberIndex !== -1) {
      observers.splice(subscriberIndex, 1);
    }
  }
}