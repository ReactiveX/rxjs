import {Subject} from './Subject';
import {Observer} from './Observer';
import {Subscription} from './Subscription';

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
export class SubjectSubscription extends Subscription {
  isUnsubscribed: boolean = false;

  constructor(public subject: Subject<any>, public observer: Observer<any>) {
    super();
  }

  unsubscribe() {
    if (this.isUnsubscribed) {
      return;
    }

    this.isUnsubscribed = true;

    const subject = this.subject;
    const observers = subject.observers;

    this.subject = null;

    if (!observers || observers.length === 0 || subject.isUnsubscribed) {
      return;
    }

    const subscriberIndex = observers.indexOf(this.observer);

    if (subscriberIndex !== -1) {
      observers.splice(subscriberIndex, 1);
    }
  }
}
