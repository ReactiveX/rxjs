import { Subject  } from 'rxjs/internal/Subject';
import { Subscriber } from './Subscriber';
import { Subscription } from './Subscription';

export class AsyncSubject<T> extends Subject<T> {
  private _hasValue = false;
  private _value: T;

  protected _init(subscriber: Subscriber<T>) {
    if (!this._disposed && this._closed && !this._hasError) {
      subscriber.next(this._value);
    }
    return super._init(subscriber);
  }

  next(value: T) {
    if (!this._closed) {
      this._hasValue = true;
      this._value = value;
    }
  }

  complete() {
    if (!this._closed && this._hasValue) {
      super.next(this._value);
    }
    super.complete();
  }
}