import Operator from '../Operator';
import Observer from '../Observer';
import Subscriber from '../Subscriber';
import Observable from '../Observable';

import tryCatch from '../util/tryCatch';
import {errorObject} from '../util/errorObject';
import bindCallback from '../util/bindCallback';

export default function buffer<T>(closingNotifier: Observable<any>): Observable<T[]> {
  return this.lift(new BufferOperator(closingNotifier));
}

class BufferOperator<T, R> implements Operator<T, R> {

  constructor(private closingNotifier: Observable<any>) {
  }

  call(observer: Observer<T>): Observer<T> {
    return new BufferSubscriber(observer, this.closingNotifier);
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