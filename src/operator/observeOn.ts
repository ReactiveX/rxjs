import { Observable } from '../Observable';
import { IScheduler } from '../Scheduler';
import { Operator } from '../Operator';
import { PartialObserver } from '../Observer';
import { Subscriber } from '../Subscriber';
import { Notification } from '../Notification';
import { TeardownLogic, Subscription } from '../Subscription';
import { Action } from '../scheduler/Action';

/**
 * @see {@link Notification}
 *
 * @param scheduler
 * @param delay
 * @return {Observable<R>|WebSocketSubject<T>|Observable<T>}
 * @method observeOn
 * @owner Observable
 */
export function observeOn<T>(this: Observable<T>, scheduler: IScheduler, delay: number = 0): Observable<T> {
  return this.lift(new ObserveOnOperator(scheduler, delay));
}

export class ObserveOnOperator<T> implements Operator<T, T> {
  constructor(private scheduler: IScheduler, private delay: number = 0) {
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
  static dispatch(this: Action<ObserveOnMessage>, arg: ObserveOnMessage) {
    const { notification, destination, subscription } = arg;
    notification.observe(destination);
    if (subscription) {
      subscription.unsubscribe();
    }
  }

  constructor(destination: Subscriber<T>,
              private scheduler: IScheduler,
              private delay: number = 0) {
    super(destination);
  }

  private scheduleMessage(notification: Notification<any>): void {
    const message = new ObserveOnMessage(notification, this.destination);
    message.subscription = this.add(
        this.scheduler.schedule(ObserveOnSubscriber.dispatch, this.delay, message)
    );
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
}

export class ObserveOnMessage {
  public subscription: Subscription;

  constructor(public notification: Notification<any>,
              public destination: PartialObserver<any>) {
  }
}
