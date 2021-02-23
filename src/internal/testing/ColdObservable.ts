import { Observable } from '../Observable.js';
import { Subscription } from '../Subscription.js';
import { Scheduler } from '../Scheduler.js';
import { TestMessage } from './TestMessage.js';
import { SubscriptionLog } from './SubscriptionLog.js';
import { SubscriptionLoggable } from './SubscriptionLoggable.js';
import { applyMixins } from '../util/applyMixins.js';
import { Subscriber } from '../Subscriber.js';
import { observeNotification } from '../Notification.js';

export class ColdObservable<T> extends Observable<T> implements SubscriptionLoggable {
  public subscriptions: SubscriptionLog[] = [];
  scheduler: Scheduler;
  // @ts-ignore: Property has no initializer and is not definitely assigned
  logSubscribedFrame: () => number;
  // @ts-ignore: Property has no initializer and is not definitely assigned
  logUnsubscribedFrame: (index: number) => void;

  constructor(public messages: TestMessage[], scheduler: Scheduler) {
    super(function (this: Observable<T>, subscriber: Subscriber<any>) {
      const observable: ColdObservable<T> = this as any;
      const index = observable.logSubscribedFrame();
      const subscription = new Subscription();
      subscription.add(
        new Subscription(() => {
          observable.logUnsubscribedFrame(index);
        })
      );
      observable.scheduleMessages(subscriber);
      return subscription;
    });
    this.scheduler = scheduler;
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
applyMixins(ColdObservable, [SubscriptionLoggable]);
