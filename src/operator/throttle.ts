import {Operator} from '../Operator';
import {Observable} from '../Observable';
import {PromiseObservable} from '../observable/fromPromise';
import {Subscriber} from '../Subscriber';
import {Subscription} from '../Subscription';

import {tryCatch} from '../util/tryCatch';
import {isPromise} from '../util/isPromise';
import {errorObject} from '../util/errorObject';

export function throttle<T>(durationSelector: (value: T) => Observable<any> | Promise<any>): Observable<T> {
  return this.lift(new ThrottleOperator(durationSelector));
}

class ThrottleOperator<T, R> implements Operator<T, R> {
  constructor(private durationSelector: (value: T) => Observable<any> | Promise<any>) {
  }

  call(subscriber: Subscriber<T>): Subscriber<T> {
    return new ThrottleSubscriber(subscriber, this.durationSelector);
  }
}

class ThrottleSubscriber<T> extends Subscriber<T> {
  private throttled: Subscription<any>;

  constructor(destination: Subscriber<T>,
              private durationSelector: (value: T) => Observable<any> | Promise<any>) {
    super(destination);
  }

  _next(value: T): void {
    if (!this.throttled) {
      const destination = this.destination;
      let duration = tryCatch(this.durationSelector)(value);
      if (duration === errorObject) {
        destination.error(errorObject.e);
        return;
      }
      if (isPromise(duration)) {
        duration = PromiseObservable.create(duration);
      }
      this.add(this.throttled = duration._subscribe(new ThrottleDurationSelectorSubscriber(this)));
      destination.next(value);
    }
  }

  _error(err: any): void {
    this.clearThrottle();
    super._error(err);
  }

  _complete(): void {
    this.clearThrottle();
    super._complete();
  }

  clearThrottle(): void {
    const throttled = this.throttled;
    if (throttled) {
      throttled.unsubscribe();
      this.remove(throttled);
      this.throttled = null;
    }
  }
}

class ThrottleDurationSelectorSubscriber<T> extends Subscriber<T> {
  constructor(private parent: ThrottleSubscriber<any>) {
    super(null);
  }

  _next(unused: T): void {
    this.parent.clearThrottle();
  }

  _error(err): void {
    this.parent.error(err);
  }

  _complete(): void {
    this.parent.clearThrottle();
  }
}
