import {Operator} from '../Operator';
import {Subscriber} from '../Subscriber';
import {Observable} from '../Observable';
import {Subscription} from '../Subscription';
import {tryCatch} from '../util/tryCatch';
import {errorObject} from '../util/errorObject';
import {_Selector} from '../types';

/**
 * buffers values from the source by opening the buffer via signals from an observable provided to `openings`, and closing
 * and sending the buffers when an observable returned by the `closingSelector` emits.
 * @param {Observable<O>} openings An observable of notifications to start new buffers
 * @param {Function} an function, that takes the value emitted by the `openings` observable and returns an Observable, which,
 *  when it emits, signals that the associated buffer should be emitted and cleared.
 * @returns {Observable<T[]>} an observable of arrays of buffered values.
 */
export function bufferToggle<T, O>(openings: Observable<O>,
                                   closingSelector: _Selector<O, Observable<any>>): Observable<T[]> {
  return this.lift(new BufferToggleOperator(openings, closingSelector));
}

class BufferToggleOperator<T, O> implements Operator<T, T[]> {

  constructor(private openings: Observable<O>,
              private closingSelector: _Selector<O, Observable<any>>) {
  }

  call(subscriber: Subscriber<T[]>): Subscriber<T> {
    return new BufferToggleSubscriber(subscriber, this.openings, this.closingSelector);
  }
}

interface BufferContext<T> {
  buffer: T[];
  subscription: Subscription<T>;
}

class BufferToggleSubscriber<T, O> extends Subscriber<T> {
  private contexts: Array<BufferContext<T>> = [];

  constructor(destination: Subscriber<T[]>,
              private openings: Observable<O>,
              private closingSelector: _Selector<O, Observable<any>>) {
    super(destination);
    this.add(this.openings._subscribe(new BufferToggleOpeningsSubscriber(this)));
  }

  _next(value: T) {
    const contexts = this.contexts;
    const len = contexts.length;
    for (let i = 0; i < len; i++) {
      contexts[i].buffer.push(value);
    }
  }

  _error(err: any) {
    const contexts = this.contexts;
    while (contexts.length > 0) {
      const context = contexts.shift();
      context.subscription.unsubscribe();
      context.buffer = null;
      context.subscription = null;
    }
    this.contexts = null;
    this.destination.error(err);
  }

  _complete() {
    const contexts = this.contexts;
    while (contexts.length > 0) {
      const context = contexts.shift();
      this.destination.next(context.buffer);
      context.subscription.unsubscribe();
      context.buffer = null;
      context.subscription = null;
    }
    this.contexts = null;
    this.destination.complete();
  }

  openBuffer(value: O) {
    const closingSelector = this.closingSelector;
    const contexts = this.contexts;

    let closingNotifier = tryCatch(closingSelector)(value);
    if (closingNotifier as any === errorObject) {
      this._error(errorObject.e);
    } else {
      let context = {
        buffer: <T[]>[],
        subscription: new Subscription<O>()
      };
      contexts.push(context);
      const subscriber = new BufferToggleClosingsSubscriber<T>(this, context);
      const subscription = closingNotifier._subscribe(subscriber);
      context.subscription.add(subscription);
      this.add(subscription);
    }
  }

  closeBuffer(context: BufferContext<T>) {
    const contexts = this.contexts;
    if (contexts === null) {
      return;
    }
    const { buffer, subscription } = context;
    this.destination.next(buffer);
    contexts.splice(contexts.indexOf(context), 1);
    this.remove(subscription);
    subscription.unsubscribe();
  }
}

class BufferToggleOpeningsSubscriber<T, O> extends Subscriber<O> {
  constructor(private parent: BufferToggleSubscriber<T, O>) {
    super(null);
  }

  _next(value: O) {
    this.parent.openBuffer(value);
  }

  _error(err: any) {
    this.parent.error(err);
  }

  _complete() {
    // noop
  }
}

class BufferToggleClosingsSubscriber<T> extends Subscriber<any> {
  constructor(private parent: BufferToggleSubscriber<T, any>,
              private context: { subscription: any, buffer: T[] }) {
    super(null);
  }

  _next() {
    this.parent.closeBuffer(this.context);
  }

  _error(err: any) {
    this.parent.error(err);
  }

  _complete() {
    this.parent.closeBuffer(this.context);
  }
}
