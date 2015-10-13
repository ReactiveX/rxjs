import Operator from '../Operator';
import Observable from '../Observable';
import PromiseObservable from '../observables/PromiseObservable';
import Subscriber from '../Subscriber';
import Subscription from '../Subscription';

import tryCatch from '../util/tryCatch';
import {errorObject} from '../util/errorObject';

export default function debounce<T>(durationSelector: (value: T) => Observable<any> | Promise<any>): Observable<T> {
  return this.lift(new DebounceOperator(durationSelector));
}

class DebounceOperator<T, R> implements Operator<T, R> {
  constructor(private durationSelector: (value: T) => Observable<any> | Promise<any>) {
  }

  call(observer: Subscriber<T>): Subscriber<T> {
    return new DebounceSubscriber(observer, this.durationSelector);
  }
}

class DebounceSubscriber<T> extends Subscriber<T> {
  private debouncedSubscription: Subscription<any> = null;
  private lastValue: any = null;
  private _index: number = 0;
  get index() {
    return this._index;
  }

  constructor(destination: Subscriber<T>,
              private durationSelector: (value: T) => Observable<any> | Promise<any>) {
    super(destination);
  }

  _next(value: T) {
    const destination = this.destination;
    const currentIndex = ++this._index;
    let debounce = tryCatch(this.durationSelector)(value);

    if (debounce === errorObject) {
      destination.error(errorObject.e);
    } else {
      if (typeof debounce.subscribe !== 'function'
        && typeof debounce.then === 'function') {
        debounce = PromiseObservable.create(debounce);
      }

      this.lastValue = value;
      this.add(this.debouncedSubscription = debounce._subscribe(new DurationSelectorSubscriber(this, currentIndex)));
    }
  }

  _complete() {
    this.debouncedNext();
    this.destination.complete();
  }

  debouncedNext(): void {
    this.clearDebounce();
    if (this.lastValue != null) {
      this.destination.next(this.lastValue);
      this.lastValue = null;
    }
  }

  private clearDebounce(): void {
    const debouncedSubscription = this.debouncedSubscription;

    if (debouncedSubscription !== null) {
      this.remove(debouncedSubscription);
      this.debouncedSubscription = null;
    }
  }
}

class DurationSelectorSubscriber<T> extends Subscriber<T> {
  constructor(private parent: DebounceSubscriber<any>,
              private currentIndex: number) {
    super(null);
  }

  private debounceNext(): void {
    const parent = this.parent;

    if (this.currentIndex === parent.index) {
      parent.debouncedNext();
      if (!this.isUnsubscribed) {
        this.unsubscribe();
      }
    }
  }

  _next(unused: T) {
     this.debounceNext();
  }

  _error(err) {
    this.parent.error(err);
  }

  _complete() {
    this.debounceNext();
  }
}