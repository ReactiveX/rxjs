import {Operator} from '../Operator';
import {Observable} from '../Observable';
import {PromiseObservable} from '../observable/fromPromise';
import {Subscriber} from '../Subscriber';
import {Subscription} from '../Subscription';

import {tryCatch} from '../util/tryCatch';
import {isPromise} from '../util/isPromise';
import {errorObject} from '../util/errorObject';
import {ObservableOrPromise, _Selector} from '../types';

export function debounce<T>(durationSelector: _Selector<T, ObservableOrPromise<number>>): Observable<T> {
  return this.lift(new DebounceOperator(durationSelector));
}

class DebounceOperator<T> implements Operator<T, T> {
  constructor(private durationSelector: _Selector<T, ObservableOrPromise<number>>) {
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
              private durationSelector: _Selector<T, ObservableOrPromise<number>>) {
    super(destination);
  }

  _next(value: T) {
    const destination = this.destination;
    const currentIndex = ++this._index;
    let debounce = tryCatch(this.durationSelector)(value);

    if (debounce as any === errorObject) {
      destination.error(errorObject.e);
    } else {
      if (isPromise(debounce)) {
        debounce = PromiseObservable.create(debounce as Promise<number>);
      }

      this.lastValue = value;
      this.clearDebounce();
      this.add(this.debouncedSubscription = (debounce as Observable<number>)._subscribe(new DurationSelectorSubscriber(this, currentIndex)));
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

    if (debouncedSubscription) {
      debouncedSubscription.unsubscribe();
      this.remove(debouncedSubscription);
      this.debouncedSubscription = null;
    }
  }
}

class DurationSelectorSubscriber<T> extends Subscriber<number> {
  constructor(private parent: DebounceSubscriber<T>,
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

  _next(unused: number) {
     this.debounceNext();
  }

  _error(err: any) {
    this.parent.error(err);
  }

  _complete() {
    this.debounceNext();
  }
}
