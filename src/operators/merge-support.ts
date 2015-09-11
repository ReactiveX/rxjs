import Operator from '../Operator';
import Subscriber from '../Subscriber';
import Observer from '../Observer';
import Observable from '../Observable';
import ScalarObservable from '../observables/ScalarObservable';
import Subscription from '../Subscription';

export class MergeOperator<T, R> implements Operator<T, R> {

  concurrent: number;

  constructor(concurrent: number = Number.POSITIVE_INFINITY) {
    this.concurrent = concurrent;
  }

  call(subscriber: Subscriber<R>): Subscriber<T> {
    return new MergeSubscriber(subscriber, this.concurrent);
  }
}

export class MergeSubscriber<T, R> extends Subscriber<T> {

  count: number = 0;
  active: number = 0;
  stopped: boolean = false;
  buffer: Observable<any>[] = [];
  concurrent: number;

  constructor(destination: Observer<R>, concurrent: number) {
    super(destination);
    this.concurrent = concurrent;
  }

  _next(value) {
    const active = this.active;
    if (active < this.concurrent) {

      const index = this.count;
      const observable = this._project(value, index);

      if (observable) {
        this.count = index + 1;
        this.active = active + 1;
        this.add(this._subscribeInner(observable, value, index));
      }
    } else {
      this._buffer(value);
    }
  }

  complete() {
    this.stopped = true;
    if (this.active === 0 && this.buffer.length === 0) {
      super.complete();
    }
  }

  _unsubscribe() {
    this.buffer = void 0;
  }

  _project(value, index) {
    return value;
  }

  _buffer(value) {
    this.buffer.push(value);
  }

  _subscribeInner(observable:Observable<any>, value, index): Subscription<any> {
    const destination = this.destination;
    if(observable._isScalar) {
      destination.next((<any>observable).value);
      this._innerComplete();
    } else {
      const subscriber = new MergeInnerSubscriber(destination, this);
      observable._subscribe(subscriber);
      return subscriber;
    }
  }

  _innerComplete() {

    const buffer = this.buffer;
    const active = this.active -= 1;
    const stopped = this.stopped;
    const pending = buffer.length;

    if (stopped && active === 0 && pending === 0) {
      super.complete();
    } else if (active < this.concurrent && pending > 0) {
      this._next(buffer.shift());
    }
  }
}

export class MergeInnerSubscriber<T, R> extends Subscriber<T> {

  parent: MergeSubscriber<T, R>;

  constructor(destination: Observer<T>, parent: MergeSubscriber<T, R>) {
    super(destination);
    this.parent = parent;
  }

  _complete() {
    this.parent._innerComplete();
  }
}
