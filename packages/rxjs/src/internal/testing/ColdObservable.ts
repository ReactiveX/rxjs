import type { Subscriber} from '@rxjs/observable';
import { Observable, Subscription } from '@rxjs/observable';
import type { TestMessage } from './TestMessage.js';
import { observeNotification } from '../Notification.js';
import type { SchedulerLike, TeardownLogic } from '../types.js';
import type { SubscriptionLog } from './subscription-logging.js';
import { logSubscribedFrame, logUnsubscribedFrame } from './subscription-logging.js';

export class ColdObservable<T> extends Observable<T> {
  public subscriptions: SubscriptionLog[] = [];
  logSubscribedFrame = logSubscribedFrame;
  logUnsubscribedFrame = logUnsubscribedFrame;

  protected _subscribe(subscriber: Subscriber<any>): TeardownLogic {
    const index = this.logSubscribedFrame();
    const subscription = new Subscription();
    subscription.add(
      new Subscription(() => {
        this.logUnsubscribedFrame(index);
      })
    );
    this.scheduleMessages(subscriber);
    return subscription;
  }

  constructor(public messages: TestMessage[], public scheduler: SchedulerLike) {
    super();
  }

  scheduleMessages(subscriber: Subscriber<any>) {
    const messagesLength = this.messages.length;
    for (let i = 0; i < messagesLength; i++) {
      const message = this.messages[i];
      subscriber.add(
        this.scheduler.schedule(
          (state) => {
            const {
              message: { notification },
              subscriber: destination,
            } = state!;
            observeNotification(notification, destination);
          },
          message.frame,
          { message, subscriber }
        )
      );
    }
  }
}
