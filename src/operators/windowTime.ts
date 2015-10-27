import Operator from '../Operator';
import Subscriber from '../Subscriber';
import Observable from '../Observable';
import Subject from '../Subject';
import Scheduler from '../Scheduler';
import Action from '../schedulers/Action';
import nextTick from '../schedulers/nextTick';

export default function windowTime<T>(windowTimeSpan: number,
                                      windowCreationInterval: number = null,
                                      scheduler: Scheduler = nextTick): Observable<Observable<T>> {
  return this.lift(new WindowTimeOperator(windowTimeSpan, windowCreationInterval, scheduler));
}

class WindowTimeOperator<T, R> implements Operator<T, R> {

  constructor(private windowTimeSpan: number,
              private windowCreationInterval: number,
              private scheduler: Scheduler) {
  }

  call(subscriber: Subscriber<T>): Subscriber<T> {
    return new WindowTimeSubscriber(
      subscriber, this.windowTimeSpan, this.windowCreationInterval, this.scheduler
    );
  }
}

class WindowTimeSubscriber<T> extends Subscriber<T> {
  private windows: Subject<T>[] = [];

  constructor(destination: Subscriber<T>,
              private windowTimeSpan: number,
              private windowCreationInterval: number,
              private scheduler: Scheduler) {
    super(destination);
    if (windowCreationInterval !== null && windowCreationInterval >= 0) {
      let window = this.openWindow();
      const closeState = { subscriber: this, window, context: null };
      const creationState = { windowTimeSpan, windowCreationInterval, subscriber: this, scheduler };
      this.add(scheduler.schedule(dispatchWindowClose, windowTimeSpan, closeState));
      this.add(scheduler.schedule(dispatchWindowCreation, windowCreationInterval, creationState));
    } else {
      let window = this.openWindow();
      const timeSpanOnlyState = { subscriber: this, window, windowTimeSpan };
      this.add(scheduler.schedule(dispatchWindowTimeSpanOnly, windowTimeSpan, timeSpanOnlyState));
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

interface TimeSpanOnlyState<T> {
  window: Subject<any>;
  windowTimeSpan: number;
  subscriber: WindowTimeSubscriber<T>;
}

function dispatchWindowTimeSpanOnly<T>(state: TimeSpanOnlyState<T>) {
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
  const timeSpanState = { subscriber, window, context };
  context.subscription = scheduler.schedule(dispatchWindowClose, windowTimeSpan, timeSpanState);
  action.add(context.subscription);
  action.schedule(state, windowCreationInterval);
}

function dispatchWindowClose({ subscriber, window, context }) {
  if (context && context.action && context.subscription) {
    context.action.remove(context.subscription);
  }
  subscriber.closeWindow(window);
}