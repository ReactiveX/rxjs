import {Observer} from './Observer';
import {Subscription} from './Subscription';
import {rxSubscriber} from './symbol/rxSubscriber';

export class Subscriber<T> extends Subscription<T> implements Observer<T> {
  [rxSubscriber]() {
    return this;
  }

  constructor(protected destination?: Observer<any>) {
    super();

    if (destination instanceof Subscriber) {
      (<any>destination).add(this);
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
    }
  }

  complete(): void {
    if (!this.isUnsubscribed) {
      this._complete();
    }
  }
}