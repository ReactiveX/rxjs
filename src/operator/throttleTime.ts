import {Operator} from '../Operator';
import {Subscriber} from '../Subscriber';
import {Scheduler} from '../Scheduler';
import {Subscription} from '../Subscription';
import {async} from '../scheduler/async';
import {Observable} from '../Observable';

/**
 * @param delay
 * @param scheduler
 * @return {Observable<R>|WebSocketSubject<T>|Observable<T>}
 * @method throttleTime
 * @owner Observable
 */
export function throttleTime<T>(delay: number, scheduler: Scheduler = async): Observable<T> {
  return this.lift(new ThrottleTimeOperator(delay, scheduler));
}

export interface ThrottleTimeSignature<T> {
  (dueTime: number, scheduler?: Scheduler): Observable<T>;
}

class ThrottleTimeOperator<T> implements Operator<T, T> {
  constructor(private delay: number, private scheduler: Scheduler) {
  }

  call(subscriber: Subscriber<T>, source: any): any {
    return source._subscribe(new ThrottleTimeSubscriber(subscriber, this.delay, this.scheduler));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class ThrottleTimeSubscriber<T> extends Subscriber<T> {
  private throttled: Subscription;

  constructor(destination: Subscriber<T>,
              private delay: number,
              private scheduler: Scheduler) {
    super(destination);
  }

  protected _next(value: T) {
    if (!this.throttled) {
      this.add(this.throttled = this.scheduler.schedule(dispatchNext, this.delay, { subscriber: this }));
      this.destination.next(value);
    }
  }

  clearThrottle() {
    const throttled = this.throttled;
    if (throttled) {
      throttled.unsubscribe();
      this.remove(throttled);
      this.throttled = null;
    }
  }
}

interface DispatchArg<T> {
  subscriber: ThrottleTimeSubscriber<T>;
}

function dispatchNext<T>(arg: DispatchArg<T>) {
  const { subscriber } = arg;
  subscriber.clearThrottle();
}
