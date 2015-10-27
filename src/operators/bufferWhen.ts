import Operator from '../Operator';
import Subscriber from '../Subscriber';
import Observable from '../Observable';
import Subscription from '../Subscription';

import tryCatch from '../util/tryCatch';
import {errorObject} from '../util/errorObject';

/**
 * Opens a buffer immediately, then closes the buffer when the observable returned by calling `closingSelector` emits a value.
 * It that immediately opens a new buffer and repeats the process
 * @param {function} a function that takes no arguments and returns an Observable that signals buffer closure
 * @returns {Observable<T[]>} an observable of arrays of buffered values.
 */
export default function bufferWhen<T>(closingSelector: () => Observable<any>): Observable<T[]> {
  return this.lift(new BufferWhenOperator(closingSelector));
}

class BufferWhenOperator<T, R> implements Operator<T, R> {

  constructor(private closingSelector: () => Observable<any>) {
  }

  call(subscriber: Subscriber<T>): Subscriber<T> {
    return new BufferWhenSubscriber(subscriber, this.closingSelector);
  }
}

class BufferWhenSubscriber<T> extends Subscriber<T> {
  private buffer: T[];
  private closingNotification: Subscription<any>;

  constructor(destination: Subscriber<T>, private closingSelector: () => Observable<any>) {
    super(destination);
    this.openBuffer();
  }

  _next(value: T) {
    this.buffer.push(value);
  }

  _error(err: any) {
    this.buffer = null;
    this.destination.error(err);
  }

  _complete() {
    const buffer = this.buffer;
    this.destination.next(buffer);
    this.buffer = null;
    this.destination.complete();
  }

  openBuffer() {
    const prevClosingNotification = this.closingNotification;
    if (prevClosingNotification) {
      this.remove(prevClosingNotification);
      prevClosingNotification.unsubscribe();
    }

    const buffer = this.buffer;
    if (buffer) {
      this.destination.next(buffer);
    }
    this.buffer = [];

    let closingNotifier = tryCatch(this.closingSelector)();
    if (closingNotifier === errorObject) {
      const err = closingNotifier.e;
      this.buffer = null;
      this.destination.error(err);
    } else {
      this.add(this.closingNotification = closingNotifier._subscribe(new BufferClosingNotifierSubscriber(this)));
    }
  }
}

class BufferClosingNotifierSubscriber<T> extends Subscriber<T> {
  constructor(private parent: BufferWhenSubscriber<any>) {
    super(null);
  }

  _next() {
    this.parent.openBuffer();
  }

  _error(err) {
    this.parent.error(err);
  }

  _complete() {
    this.parent.openBuffer();
  }
}