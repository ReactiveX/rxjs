import { Subject } from '../Subject.js';
import { Subscriber } from '../Subscriber.js';
import { Subscription } from '../Subscription.js';
import { Scheduler } from '../Scheduler.js';
import { TestMessage } from './TestMessage.js';
import { observeNotification } from '../Notification.js';
import { logSubscribedFrame, logUnsubscribedFrame, SubscriptionLog } from './subscription-logging.js';

export class HotObservable<T> extends Subject<T> {
  public subscriptions: SubscriptionLog[] = [];

  logSubscribedFrame = logSubscribedFrame;

  logUnsubscribedFrame = logUnsubscribedFrame;

  constructor(public messages: TestMessage[], public scheduler: Scheduler) {
    super();
  }

  /** @internal */
  protected _subscribe(subscriber: Subscriber<any>): Subscription {
    const index = this.logSubscribedFrame();
    const subscription = new Subscription();
    subscription.add(
      new Subscription(() => {
        this.logUnsubscribedFrame(index);
      })
    );
    subscription.add(super._subscribe(subscriber));
    return subscription;
  }

  setup() {
    for (const { notification, frame } of this.messages) {
      this.scheduler.schedule(() => {
        observeNotification(notification, this);
      }, frame);
    }
  }
}
