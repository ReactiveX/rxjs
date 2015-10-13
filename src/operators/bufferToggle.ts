import Operator from '../Operator';
import Observer from '../Observer';
import Subscriber from '../Subscriber';
import Observable from '../Observable';
import Subject from '../Subject';
import Subscription from '../Subscription';

import tryCatch from '../util/tryCatch';
import {errorObject} from '../util/errorObject';
import bindCallback from '../util/bindCallback';

/**
 * buffers values from the source by opening the buffer via signals from an observable provided to `openings`, and closing
 * and sending the buffers when an observable returned by the `closingSelector` emits.
 * @param {Observable<O>} openings An observable of notifications to start new buffers
 * @param {Function} an function, that takes the value emitted by the `openings` observable and returns an Observable, which,
 *  when it emits, signals that the associated buffer should be emitted and cleared.
 * @returns {Observable<T[]>} an observable of arrays of buffered values.
 */
export default function bufferToggle<T, O>(openings: Observable<O>,
                                           closingSelector: (openValue: O) => Observable<any>): Observable<T[]> {
  return this.lift(new BufferToggleOperator<T, T, O>(openings, closingSelector));
}

class BufferToggleOperator<T, R, O> implements Operator<T, R> {

  constructor(private openings: Observable<O>,
              private closingSelector: (openValue: O) => Observable<any>) {
  }

  call(subscriber: Subscriber<T>): Subscriber<T> {
    return new BufferToggleSubscriber<T, O>(subscriber, this.openings, this.closingSelector);
  }
}

class BufferToggleSubscriber<T, O> extends Subscriber<T> {
  private buffers: Array<T[]> = [];
  private closingNotification: Subscription<any>;

  constructor(destination: Subscriber<T>,
              private openings: Observable<O>,
              private closingSelector: (openValue: O) => Observable<any>) {
    super(destination);
    this.add(this.openings._subscribe(new BufferToggleOpeningsSubscriber(this)));
  }

  _next(value: T) {
    const buffers = this.buffers;
    const len = buffers.length;
    for (let i = 0; i < len; i++) {
      buffers[i].push(value);
    }
  }

  _error(err: any) {
    this.buffers = null;
    this.destination.error(err);
  }

  _complete() {
    const buffers = this.buffers;
    while (buffers.length > 0) {
      this.destination.next(buffers.shift());
    }
    this.destination.complete();
  }

  openBuffer(value: O) {
    const closingSelector = this.closingSelector;
    const buffers = this.buffers;

    let closingNotifier = tryCatch(closingSelector)(value);
    if (closingNotifier === errorObject) {
      const err = closingNotifier.e;
      this.buffers = null;
      this.destination.error(err);
    } else {
      let buffer = [];
      let context = {
        buffer,
        subscription: new Subscription()
      };
      buffers.push(buffer);
      const subscriber = new BufferClosingNotifierSubscriber(this, context);
      const subscription = closingNotifier._subscribe(subscriber);
      this.add(context.subscription.add(subscription));
    }
  }

  closeBuffer(context: { subscription: any, buffer: T[] }) {
    const { buffer, subscription } = context;
    const buffers = this.buffers;
    this.destination.next(buffer);
    buffers.splice(buffers.indexOf(buffer), 1);
    this.remove(subscription);
    subscription.unsubscribe();
  }
}

class BufferClosingNotifierSubscriber<T> extends Subscriber<T> {
  constructor(private parent: BufferToggleSubscriber<any, T>, private context: { subscription: any, buffer: T[] }) {
    super(null);
  }

  _next() {
    this.parent.closeBuffer(this.context);
  }

  _error(err) {
    this.parent.error(err);
  }

  _complete() {
    // noop
  }
}

class BufferToggleOpeningsSubscriber<T> extends Subscriber<T> {
  constructor(private parent: BufferToggleSubscriber<any, T>) {
    super(null);
  }

  _next(value: T) {
    this.parent.openBuffer(value);
  }

  _error(err) {
    this.parent.error(err);
  }

  _complete() {
    // noop
  }
}