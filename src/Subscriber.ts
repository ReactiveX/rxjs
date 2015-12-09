import {noop} from './util/noop';
import {throwError} from './util/throwError';
import {tryOrOnError} from './util/tryOrOnError';

import {Observer} from './Observer';
import {Subscription} from './Subscription';
import {rxSubscriber} from './symbol/rxSubscriber';

export class Subscriber<T> extends Subscription<T> implements Observer<T> {
  protected _subscription: Subscription<T>;
  protected _isUnsubscribed: boolean = false;

  [rxSubscriber]() {
    return this;
  }

  get isUnsubscribed(): boolean {
    const subscription = this._subscription;
    if (subscription) {
      // route to the shared Subscription if it exists
      return this._isUnsubscribed || subscription.isUnsubscribed;
    } else {
      return this._isUnsubscribed;
    }
  }

  set isUnsubscribed(value: boolean) {
    const subscription = this._subscription;
    if (subscription) {
      // route to the shared Subscription if it exists
      subscription.isUnsubscribed = Boolean(value);
    } else {
      this._isUnsubscribed = Boolean(value);
    }
  }

  static create<T>(next?: (x?: T) => void,
                   error?: (e?: any) => void,
                   complete?: () => void): Subscriber<T> {
    const subscriber = new Subscriber<T>();
    subscriber._next = (typeof next === 'function') && tryOrOnError(next) || noop;
    subscriber._error = (typeof error === 'function') && error || throwError;
    subscriber._complete = (typeof complete === 'function') && complete || noop;
    return subscriber;
  }

  constructor(protected destination?: Observer<any>) {
    super();

    if (!this.destination) {
      return;
    }
    const subscription = (<any> destination)._subscription;
    if (subscription) {
      this._subscription = subscription;
    } else if (destination instanceof Subscriber) {
      this._subscription = (<Subscription<T>> destination);
    }
  }

  add(sub: Subscription<any> | Function | void): void {
    // route add to the shared Subscription if it exists
    const _subscription = this._subscription;
    if (_subscription) {
      _subscription.add(sub);
    } else {
      super.add(sub);
    }
  }

  remove(sub: Subscription<any>): void {
    // route remove to the shared Subscription if it exists
    if (this._subscription) {
      this._subscription.remove(sub);
    } else {
      super.remove(sub);
    }
  }

  unsubscribe(): void {
    if (this._isUnsubscribed) {
      return;
    } else if (this._subscription) {
      this._isUnsubscribed = true;
    } else {
      super.unsubscribe();
    }
  }

  _next(value: T): void {
    const destination = this.destination;
    if (destination.next) {
      destination.next(value);
    }
  }

  _error(err: any): void {
    const destination = this.destination;
    if (destination.error) {
      destination.error(err);
    }
  }

  _complete(): void {
    const destination = this.destination;
    if (destination.complete) {
      destination.complete();
    }
  }

  next(value?: T): void {
    if (!this.isUnsubscribed) {
      this._next(value);
    }
  }

  error(err?: any): void {
    if (!this.isUnsubscribed) {
      this._error(err);
      this.unsubscribe();
    }
  }

  complete(): void {
    if (!this.isUnsubscribed) {
      this._complete();
      this.unsubscribe();
    }
  }
}