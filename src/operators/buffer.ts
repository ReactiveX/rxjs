import Operator from '../Operator';
import Observer from '../Observer';
import Subscriber from '../Subscriber';
import Observable from '../Observable';

import tryCatch from '../util/tryCatch';
import {errorObject} from '../util/errorObject';
import bindCallback from '../util/bindCallback';

/**
 * buffers the incoming observable values until the passed `closingNotifier` emits a value, at which point
 * it emits the buffer on the returned observable and starts a new buffer internally, awaiting the
 * next time `closingNotifier` emits
 * 
 * @param {Observable<any>} closingNotifier an observable, that signals the buffer to be emitted from the returned observable
 * @returns {Observable<T[]>} an observable of buffers, which are arrays of values
 */
export default function buffer<T>(closingNotifier: Observable<any>): Observable<T[]> {
  return this.lift(new BufferOperator(closingNotifier));
}

class BufferOperator<T, R> implements Operator<T, R> {

  constructor(private closingNotifier: Observable<any>) {
  }

  call(subscriber: Subscriber<T>): Subscriber<T> {
    return new BufferSubscriber(subscriber, this.closingNotifier);
  }
}

class BufferSubscriber<T> extends Subscriber<T> {
  buffer: T[] = [];
  
  constructor(destination: Observer<T>, closingNotifier: Observable<any>) {
    super(destination);
    this.add(closingNotifier._subscribe(new BufferClosingNotifierSubscriber(this)));
  }
  
  _next(value: T) {
    this.buffer.push(value);
  }
  
  _error(err: any) {
    this.destination.error(err);
  }
  
  _complete() {
    this.flushBuffer();
    this.destination.complete();
  }
  
  flushBuffer() {
    const buffer = this.buffer;
    this.buffer = [];
    this.destination.next(buffer);
  }
}

class BufferClosingNotifierSubscriber<T> extends Subscriber<T> {
  constructor(private parent: BufferSubscriber<any>) {
    super(null);
  }
  
  _next(value: T) {
    this.parent.flushBuffer();
  }
  
  _error(err: any) {
    this.parent.error(err);
  }
  
  _complete() {
    // noop
  }
}