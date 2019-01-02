import { Observer } from './types';
import { Subscription } from './Subscription';

export abstract class Subscriber<T> implements Observer<T> {
  protected _subscription = new Subscription();
  protected _closed = false;

  get closed() {
    return this._closed || this._subscription.closed;
  }

  next(value: T): void {
    if (!this.closed) {
      this._next(value);
    }
  }

  abstract _next(value: T): void;

  error(err: any): void {
    if (!this.closed) {
      this._closed = true;
      this._error(err);
      this._subscription.unsubscribe();
    } else {
      console.warn('Subscription called error multiple times');
    }
  }

  abstract _error(err: any): void;

  complete(): void {
    if (!this.closed) {
      this._closed = true;
      this._complete();
      this._subscription.unsubscribe();
    }
  }

  abstract _complete(): void;
}
