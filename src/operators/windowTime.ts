import Operator from '../Operator';
import Observer from '../Observer';
import Subscriber from '../Subscriber';
import Observable from '../Observable';
import Subject from '../Subject';
import Subscription from '../Subscription';
import Scheduler from '../Scheduler';
import Action from '../schedulers/Action';
import nextTick from '../schedulers/nextTick';

import tryCatch from '../util/tryCatch';
import {errorObject} from '../util/errorObject';
import bindCallback from '../util/bindCallback';

export default function windowTime<T>(windowTimeSpan: number, windowCreationInterval: number = null, scheduler: Scheduler = nextTick) : Observable<Observable<T>> {
  return this.lift(new WindowTimeOperator(windowTimeSpan, windowCreationInterval, scheduler));
}

class WindowTimeOperator<T, R> implements Operator<T, R> {

  constructor(private windowTimeSpan: number, private windowCreationInterval: number, private scheduler: Scheduler) {
  }

  call(subscriber: Subscriber<T>): Subscriber<T> {
    return new WindowTimeSubscriber(subscriber, this.windowTimeSpan, this.windowCreationInterval, this.scheduler);
  }
}

class WindowTimeSubscriber<T> extends Subscriber<T> {
  private windows: Subject<T>[] = [];
  
  constructor(destination: Observer<T>, private windowTimeSpan: number, private windowCreationInterval: number, private scheduler: Scheduler) {
    super(destination);
    if (windowCreationInterval !== null && windowCreationInterval >= 0) {
      let window = this.openWindow();
      this.add(scheduler.schedule(dispatchWindowClose, windowTimeSpan, { subscriber: this, window, context: null }))
      this.add(scheduler.schedule(dispatchWindowCreation, windowCreationInterval, { windowTimeSpan, windowCreationInterval, subscriber: this, scheduler }))
    } else {
      let window = this.openWindow();
      this.add(scheduler.schedule(dispatchWindowTimeSpanOnly, windowTimeSpan, { subscriber: this, window, windowTimeSpan }));
    }
  }
  
  _next(value: T) {
    const windows = this.windows;
    const len = windows.length;
    for (let i = 0; i < len; i++) {
      windows[i].next(value);
    }
  }
  
  _error(err) {
    const windows = this.windows;
    while (windows.length > 0) {
      windows.shift().error(err);
    }
    this.destination.error(err);
  }
  
  _complete() {
    const windows = this.windows;
    while (windows.length > 0) {
      windows.shift().complete();
    }
    this.destination.complete();
  }
  
  openWindow(): Subject<T> {
    let window = new Subject<T>();
    this.windows.push(window);
    this.destination.next(window);
    return window;
  }
  
  closeWindow(window: Subject<T>) {
    window.complete();
    const windows = this.windows;
    windows.splice(windows.indexOf(window), 1);
  }
}

function dispatchWindowTimeSpanOnly<T>(state: { window: Subject<any>, windowTimeSpan: number, subscriber: WindowTimeSubscriber<T>}) {
  const { subscriber, windowTimeSpan, window } = state;
  if (window) {
    window.complete();
  }
  state.window = subscriber.openWindow();
  (<any>this).schedule(state, windowTimeSpan);
}

function dispatchWindowCreation(state) {
  let { windowTimeSpan, subscriber, scheduler, windowCreationInterval } = state;
  let window = subscriber.openWindow();
  let action = <Action>this;
  let context = { action, subscription: null };
  action.add(context.subscription = scheduler.schedule(dispatchWindowClose, windowTimeSpan, { subscriber, window, context }));
  action.schedule(state, windowCreationInterval);
}

function dispatchWindowClose({ subscriber, window, context }) {
  if (context && context.action && context.subscription) {
    context.action.remove(context.subscription);
  }
  subscriber.closeWindow(window);
}