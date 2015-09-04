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

  call(observer: Observer<T>): Observer<T> {
    return new WindowTimeSubscriber(observer, this.windowTimeSpan, this.windowCreationInterval, this.scheduler);
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
      this.add(scheduler.schedule(dispatchWindowTimeSpanOnly, windowTimeSpan, { subscriber: this, window }));
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

function dispatchWindowTimeSpanOnly(state) {
  const subscriber: WindowTimeSubscriber<any> = state.subscriber;

  const prevWindow: Subject<any> = state.window;
  if (prevWindow) {
    prevWindow.complete();
  }
  
  let window = subscriber.openWindow();
  (<any>this).schedule({ subscriber, window });
}

function dispatchWindowCreation(state) {
  let { windowTimeSpan, subscriber, scheduler } = state;
  let window = subscriber.openWindow();
  let action = <Action>this;
  let context = { action, subscription: null };
  action.add(context.subscription = scheduler.schedule(dispatchWindowClose, windowTimeSpan, { subscriber, window, context }));
  action.schedule(state);
}

function dispatchWindowClose({ subscriber, window, context }) {
  if (context && context.action && context.subscription) {
    context.action.remove(context.subscription);
  }
  subscriber.closeWindow(window);
}