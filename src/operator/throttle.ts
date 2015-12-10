import {Operator} from '../Operator';
import {Observable} from '../Observable';
import {PromiseObservable} from '../observable/fromPromise';
import {Subscriber} from '../Subscriber';
import {Subscription} from '../Subscription';

import {tryCatch} from '../util/tryCatch';
import {isPromise} from '../util/isPromise';
import {errorObject} from '../util/errorObject';
import {ObservableOrPromise, _Selector} from '../types';

export function throttle<T>(durationSelector: _Selector<T, ObservableOrPromise<number>>): Observable<T> {
  return this.lift(new ThrottleOperator(durationSelector));
}

class ThrottleOperator<T> implements Operator<T, T> {
  constructor(private durationSelector: (value: T) => ObservableOrPromise<any>) {
  }

  call(subscriber: Subscriber<T>): Subscriber<T> {
    return new ThrottleSubscriber(subscriber, this.durationSelector);
  }
}

class ThrottleSubscriber<T> extends Subscriber<T> {
  private throttled: Subscription<any>;

  constructor(destination: Subscriber<T>,
              private durationSelector: _Selector<T, ObservableOrPromise<number>>) {
    super(destination);
  }

  _next(value: T): void {
    if (!this.throttled) {
      const destination = this.destination;
      let duration = tryCatch(this.durationSelector)(value);
      if (duration as any === errorObject) {
        destination.error(errorObject.e);
        return;
      }
      if (isPromise(duration)) {
        duration = PromiseObservable.create(duration as Promise<number>);
      }

      this.add(this.throttled = (duration as Observable<number>)._subscribe(new ThrottleDurationSelectorSubscriber(this)));
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

  _error(err: any): void {
    this.parent.error(err);
  }

  _complete(): void {
    this.parent.clearThrottle();
  }
}
