import Operator from '../Operator';
import Observer from '../Observer';
import Subscriber from '../Subscriber';
import Scheduler from '../Scheduler';
import Observable from '../Observable';
import Subscription from '../Subscription';
import nextTick from '../schedulers/nextTick';

import tryCatch from '../util/tryCatch';
import {errorObject} from '../util/errorObject';
import bindCallback from '../util/bindCallback';

export default function debounce<T>(dueTime: number, scheduler: Scheduler = nextTick): Observable<T> {
  return this.lift(new DebounceOperator(dueTime, scheduler));
}

class DebounceOperator<T, R> implements Operator<T, R> {

  constructor(private dueTime: number, private scheduler: Scheduler) {
  }

  call(subscriber: Subscriber<T>): Subscriber<T> {
    return new DebounceSubscriber(subscriber, this.dueTime, this.scheduler);
  }
}

class DebounceSubscriber<T> extends Subscriber<T> {
  private debounced: Subscription<any>;

  constructor(destination: Observer < T >, private dueTime: number, private scheduler: Scheduler) {
    super(destination);
  }

  _next(value: T) {
    if (!this.debounced) {
      this.add(this.debounced = this.scheduler.schedule(dispatchNext, this.dueTime, { value, subscriber: this }));
    }
  }

  clearDebounce() {
    const debounced = this.debounced;
    if (debounced) {
      debounced.unsubscribe();
      this.remove(debounced);
    }
  }

  debouncedNext(value: T) {
    this.clearDebounce();
    this.destination.next(value);
  }
}

function dispatchNext<T>({ value, subscriber }) {
  subscriber.debouncedNext(value);
}