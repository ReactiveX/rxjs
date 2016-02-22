import {Operator} from '../Operator';
import {Subscriber} from '../Subscriber';
import {Observable} from '../Observable';
import {Subscription} from '../Subscription';
import {tryCatch} from '../util/tryCatch';
import {errorObject} from '../util/errorObject';

import {OuterSubscriber} from '../OuterSubscriber';
import {InnerSubscriber} from '../InnerSubscriber';
import {subscribeToResult} from '../util/subscribeToResult';

/**
 * Opens a buffer immediately, then closes the buffer when the observable
 * returned by calling `closingSelector` emits a value. It that immediately
 * opens a new buffer and repeats the process.
 *
 * <img src="./img/bufferWhen.png" width="100%">
 *
 * @param {function} closingSelector a function that takes no arguments and
 * returns an Observable that signals buffer closure.
 * @return {Observable<T[]>} an observable of arrays of buffered values.
 * @method bufferWhen
 * @owner Observable
 */
export function bufferWhen<T>(closingSelector: () => Observable<any>): Observable<T[]> {
  return this.lift(new BufferWhenOperator<T>(closingSelector));
}

export interface BufferWhenSignature<T> {
  (closingSelector: () => Observable<any>): Observable<T[]>;
}

class BufferWhenOperator<T> implements Operator<T, T[]> {

  constructor(private closingSelector: () => Observable<any>) {
  }

  call(subscriber: Subscriber<T[]>): Subscriber<T> {
    return new BufferWhenSubscriber(subscriber, this.closingSelector);
  }
}

class BufferWhenSubscriber<T> extends OuterSubscriber<T, any> {
  private buffer: T[];
  private subscribing: boolean = false;
  private closingSubscription: Subscription;

  constructor(destination: Subscriber<T[]>, private closingSelector: () => Observable<any>) {
    super(destination);
    this.openBuffer();
  }

  protected _next(value: T) {
    this.buffer.push(value);
  }

  protected _complete() {
    const buffer = this.buffer;
    if (buffer) {
      this.destination.next(buffer);
    }
    super._complete();
  }

  protected _unsubscribe() {
    this.buffer = null;
    this.subscribing = false;
  }

  notifyNext(outerValue: T, innerValue: any,
             outerIndex: number, innerIndex: number,
             innerSub: InnerSubscriber<T, any>): void {
    this.openBuffer();
  }

  notifyComplete(): void {
    if (this.subscribing) {
      this.complete();
    } else {
      this.openBuffer();
    }
  }

  openBuffer() {

    let { closingSubscription } = this;

    if (closingSubscription) {
      this.remove(closingSubscription);
      closingSubscription.unsubscribe();
    }

    const buffer = this.buffer;
    if (this.buffer) {
      this.destination.next(buffer);
    }

    this.buffer = [];

    const closingNotifier = tryCatch(this.closingSelector)();

    if (closingNotifier === errorObject) {
      this.error(errorObject.e);
    } else {
      closingSubscription = new Subscription();
      this.closingSubscription = closingSubscription;
      this.add(closingSubscription);
      this.subscribing = true;
      closingSubscription.add(subscribeToResult(this, closingNotifier));
      this.subscribing = false;
    }
  }
}
