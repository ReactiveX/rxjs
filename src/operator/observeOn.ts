import { Observable } from '../Observable';
import { Scheduler } from '../Scheduler';
import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';
import { Notification } from '../Notification';
import { Subscription, TeardownLogic } from '../Subscription';

/**
 * @see {@link Notification}
 *
 * @param scheduler
 * @param delay
 * @return {Observable<R>|WebSocketSubject<T>|Observable<T>}
 * @method observeOn
 * @owner Observable
 */
export function observeOn<T>(this: Observable<T>, scheduler: Scheduler, delay: number = 0): Observable<T> {
  return this.lift(new ObserveOnOperator(scheduler, delay));
}

export class ObserveOnOperator<T> implements Operator<T, T> {
  constructor(private scheduler: Scheduler, private delay: number = 0) {
  }

  call(subscriber: Subscriber<T>, source: any): TeardownLogic {
    return source.subscribe(new ObserveOnSubscriber(subscriber, this.scheduler, this.delay));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
export class ObserveOnSubscriber<T> extends Subscriber<T> {
  private static dispatch(context: ObserveOnContext): void {
    const { notification, subscriber, subscription } = context;
    subscriber.observe(notification, subscription);
  }

  constructor(protected destination: Subscriber<T>,
              private scheduler: Scheduler,
              private delay: number = 0) {
    super(destination);
  }

  private scheduleMessage(notification: Notification<any>): void {
    const message = new ObserveOnContext(notification, this);
    const subscription = this.scheduler.schedule(ObserveOnSubscriber.dispatch, this.delay, message);

    //do not add into subscription if scheduled synchronously
    if (!subscription.closed) {
      this.add(message.subscription = subscription);
    }
   }

  protected _next(value: T): void {
    this.scheduleMessage(Notification.createNext(value));
  }

  protected _error(err: any): void {
    this.scheduleMessage(Notification.createError(err));
  }

  protected _complete(): void {
    this.scheduleMessage(Notification.createComplete());
  }

  public observe(notification: Notification<any>, subscription: Subscription): void {
    notification.observe(this.destination);
    this.remove(subscription);
  }
}

class ObserveOnContext {
  public subscription: Subscription;
  constructor(public readonly notification: Notification<any>,
              public readonly subscriber: ObserveOnSubscriber<any>) {
  }
}
