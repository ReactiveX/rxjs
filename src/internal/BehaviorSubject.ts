import { Subject } from './Subject';
import { MutableSubscriber } from 'rxjs/internal/MutableSubscriber';

export class BehaviorSubject<T> extends Subject<T> {
  private _lastValue: T;

  get value() {
    return this._lastValue;
  }

  getValue() {
    return this._lastValue;
  }

  constructor(initialValue: T) {
    super();
    this._lastValue = initialValue;
  }

  protected _init(mut: MutableSubscriber<T>) {
    if (!this._closed) {
      mut.next(this._lastValue);
    }
    return super._init(mut);
  }

  next(value: T) {
    if (!this._closed) {
      this._lastValue = value;
      super.next(value);
    }
  }
}
