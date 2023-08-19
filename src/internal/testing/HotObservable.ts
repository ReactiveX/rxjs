import { Subject } from '../Subject';
import { Subscriber } from '../Subscriber';
import { Subscription } from '../Subscription';
import { Scheduler } from '../Scheduler';
import { TestMessage } from './TestMessage';
import { observeNotification } from '../Notification';
import { logSubscribedFrame, logUnsubscribedFrame, SubscriptionLog } from './subscription-logging';

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
