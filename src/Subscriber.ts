import noop from './util/noop';
import throwError from './util/throwError';
import tryOrOnError from './util/tryOrOnError';

import Observer from './Observer';
import Subscription from './Subscription';


export default class Subscriber<T> extends Subscription<T> implements Observer<T> {
  protected destination: Observer<any>;

  private _subscription: Subscription<T>;

  private _isUnsubscribed: boolean = false;
  
  static create<T>(next    ?: (x?:any) => void,
                   error   ?: (e?:any) => void,
                   complete?: () => void): Subscriber<T> {
    const subscriber = new Subscriber<T>();
    subscriber._next = (typeof next === "function") && tryOrOnError(next) || noop;
    subscriber._error = (typeof error === "function") && error || throwError;
    subscriber._complete = (typeof complete === "function") && complete || noop;
    return subscriber;
  }
  
  _next(value: T) {
    this.destination.next(value);
  }
  
  _error(err: any) {
    this.destination.error(err);
  }
  
  _complete() {
    this.destination.complete();
  }

  constructor(destination?: Observer<any>) {
    super();
    this.destination = destination;
    
    if (!destination) {
      return;
    }
    const subscription = (<any> destination)._subscription;
    if (subscription) {
      this._subscription = subscription;
    } else if (destination instanceof Subscriber) {
      this._subscription = (<Subscription<T>> destination);
    }
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

  add(sub: Subscription<T>|Function|void) {
    // route add to the shared Subscription if it exists
    const _subscription = this._subscription;
    if (_subscription) {
      _subscription.add(sub);
    } else {
      super.add(sub);
    }
  }

  remove(sub: Subscription<T>) {
    // route remove to the shared Subscription if it exists
    if (this._subscription) {
      this._subscription.remove(sub);
    } else {
      super.remove(sub);
    }
  }

  unsubscribe() {
    if(this._isUnsubscribed) {
      return;
    } else if(this._subscription) {
      this._isUnsubscribed = true;
    } else {
      super.unsubscribe();
    }
  }

  next(value?) {
    if (!this.isUnsubscribed) {
      this._next(value);
    }
  }

  error(error?) {
    if (!this.isUnsubscribed) {
      this._error(error);
      this.unsubscribe();
    }
  }

  complete() {
    if (!this.isUnsubscribed) {
      this._complete();
      this.unsubscribe();
    }
  }
}
