import { Subject } from "./Subject";
import { Subscriber } from "./Subscriber";


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

  protected _init(subscriber: Subscriber<T>) {
    if (!this._closed) {
      subscriber.next(this._lastValue);
    }
    return super._init(subscriber);
  }

  next(value: T) {
    if (!this._closed) {
      this._lastValue = value;
      super.next(value);
    }
  }
}