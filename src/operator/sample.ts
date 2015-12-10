import {Operator} from '../Operator';
import {Observable} from '../Observable';
import {Subscriber} from '../Subscriber';

import {OuterSubscriber} from '../OuterSubscriber';
import {subscribeToResult} from '../util/subscribeToResult';

export function sample<T>(notifier: Observable<any>): Observable<T> {
  return this.lift(new SampleOperator(notifier));
}

class SampleOperator<T> implements Operator<T, T> {
  constructor(private notifier: Observable<any>) {
  }

  call(subscriber: Subscriber<T>) {
    return new SampleSubscriber(subscriber, this.notifier);
  }
}

class SampleSubscriber<T, R> extends OuterSubscriber<T, R> {
  private value: T;
  private hasValue: boolean = false;

  constructor(destination: Subscriber<any>, notifier: Observable<any>) {
    super(destination);
    this.add(subscribeToResult(this, notifier));
  }

  _next(value: T) {
    this.value = value;
    this.hasValue = true;
  }

  notifyNext(outerValue: T, innerValue: R, outerIndex: number, innerIndex: number): void {
    this.emitValue();
  }

  notifyComplete(): void {
    this.emitValue();
  }

  emitValue() {
    if (this.hasValue) {
      this.hasValue = false;
      this.destination.next(this.value);
    }
  }
}
