import { Subject } from '../Subject.js';
import type { Subscriber} from '@rxjs/observable';
import { Subscription } from '@rxjs/observable';
import type { Scheduler } from '../Scheduler.js';
import type { TestMessage } from './TestMessage.js';
import { observeNotification } from '../Notification.js';
import type { SubscriptionLog } from './subscription-logging.js';
import { logSubscribedFrame, logUnsubscribedFrame } from './subscription-logging.js';

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
