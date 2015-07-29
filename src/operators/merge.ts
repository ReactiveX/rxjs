import Operator from '../Operator';
import Observer from '../Observer';
import Scheduler from '../Scheduler';
import Observable from '../Observable';
import Subscriber from '../Subscriber';

import ArrayObservable from '../observables/ArrayObservable';
import ScalarObservable from '../observables/ScalarObservable';

import tryCatch from '../util/tryCatch';
import {errorObject} from '../util/errorObject';

export default function merge(scheduler?: any, concurrent?: any, ...observables: Observable<any>[]) {
  const xs = [];
  if (typeof this.subscribe === "function") {
    xs.push(this);
  }
  if (concurrent && typeof concurrent.subscribe === "function") {
    xs.push(concurrent);
    concurrent = scheduler;
  }
  if (scheduler && typeof scheduler === "object") {
    if (typeof scheduler.subscribe === "function") {
      xs.push(scheduler);
      scheduler = undefined;
      concurrent = Number.POSITIVE_INFINITY;
    } else if(typeof scheduler.schedule === "function") {
      concurrent = Number.POSITIVE_INFINITY;
    }
  }
  return new ArrayObservable(xs.concat(observables), scheduler).lift(new MergeOperator(concurrent));
}

export class MergeOperator<T, R> extends Operator<T, R> {

  concurrent: number;

  constructor(concurrent: number = Number.POSITIVE_INFINITY) {
    super();
    this.concurrent = concurrent;
  }

  call(observer: Observer<R>): Observer<T> {
    return new MergeSubscriber(observer, this.concurrent);
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

  _complete() {
    this.stopped = true;
    if (this.active === 0 && this.buffer.length === 0) {
      this.destination.complete();
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

  _subscribeInner(observable, value, index) {
    if(observable instanceof ScalarObservable) {
      this.destination.next((<ScalarObservable<T>> observable).value);
      this._innerComplete();
    } else {
      return observable._subscribe(new MergeInnerSubscriber(this));
    }
  }

  _innerComplete() {

    const buffer = this.buffer;
    const active = this.active -= 1;
    const stopped = this.stopped;
    const pending = buffer.length;

    if (stopped && active === 0 && pending === 0) {
      this.destination.complete();
    } else if (active < this.concurrent && pending > 0) {
      this._next(buffer.shift());
    }
  }
}

export class MergeInnerSubscriber<T, R> extends Subscriber<T> {

  parent: MergeSubscriber<T, R>;

  constructor(parent: MergeSubscriber<T, R>) {
    super(parent.destination);
    this.parent = parent;
  }

  _complete() {
    this.parent._innerComplete();
  }
}
