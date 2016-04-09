import {Observable} from '../Observable';
import {Scheduler} from '../Scheduler';
import {Operator} from '../Operator';
import {PartialObserver} from '../Observer';
import {Subscriber} from '../Subscriber';
import {Notification} from '../Notification';

/**
 * @see {@link Notification}
 *
 * @param scheduler
 * @param delay
 * @return {Observable<R>|WebSocketSubject<T>|Observable<T>}
 * @method observeOn
 * @owner Observable
 */
export function observeOn<T>(scheduler: Scheduler, delay: number = 0): Observable<T> {
  return this.lift(new ObserveOnOperator(scheduler, delay));
}

export interface ObserveOnSignature<T> {
  (scheduler: Scheduler, delay?: number): Observable<T>;
}

export class ObserveOnOperator<T> implements Operator<T, T> {
  constructor(private scheduler: Scheduler, private delay: number = 0) {
  }

  call(subscriber: Subscriber<T>, source: any): any {
    return source._subscribe(new ObserveOnSubscriber(subscriber, this.scheduler, this.delay));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
export class ObserveOnSubscriber<T> extends Subscriber<T> {
  static dispatch(arg: ObserveOnMessage) {
    const { notification, destination } = arg;
    notification.observe(destination);
  }

  constructor(destination: Subscriber<T>,
              private scheduler: Scheduler,
              private delay: number = 0) {
    super(destination);
  }

  private scheduleMessage(notification: Notification<any>): void {
     this.add(this.scheduler.schedule(ObserveOnSubscriber.dispatch,
                                      this.delay,
                                      new ObserveOnMessage(notification, this.destination)));
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
  constructor(public notification: Notification<any>,
              public destination: PartialObserver<any>) {
  }
}
