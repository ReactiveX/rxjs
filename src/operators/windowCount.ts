import Operator from '../Operator';
import Observer from '../Observer';
import Subscriber from '../Subscriber';
import Observable from '../Observable';
import Subject from '../Subject';
import Subscription from '../Subscription';
import Scheduler from '../Scheduler';

import tryCatch from '../util/tryCatch';
import {errorObject} from '../util/errorObject';
import bindCallback from '../util/bindCallback';

export default function windowCount<T>(windowSize: number, startWindowEvery: number = 0) : Observable<Observable<T>> {
  return this.lift(new WindowCountOperator(windowSize, startWindowEvery));
}

class WindowCountOperator<T, R> implements Operator<T, R> {

  constructor(private windowSize: number, private startWindowEvery: number) {
  }

  call(observer: Observer<T>): Observer<T> {
    return new WindowCountSubscriber(observer, this.windowSize, this.startWindowEvery);
  }
}

class WindowCountSubscriber<T> extends Subscriber<T> {
  private windows: { count: number, window: Subject<T> } [] = [];
  private count: number = 0;
  
  constructor(destination: Observer<T>, private windowSize: number, private startWindowEvery: number) {
    super(destination); 
  }
  
  _next(value: T) {
    const count = (this.count += 1);
    const startWindowEvery = this.startWindowEvery;
    const windowSize = this.windowSize;
    const windows = this.windows;
    
    if (startWindowEvery && count % this.startWindowEvery === 0) {
      let window = new Subject<T>();
      windows.push({ count: 0, window });
      this.destination.next(window);
    }
    
    const len = windows.length;
    for (let i = 0; i < len; i++) {
      let w = windows[i];
      const window = w.window;
      window.next(value);
      if (windowSize === (w.count += 1)) {
        window.complete();  
      }
    }
  }
  
  _error(err: any) {
    const windows = this.windows;
    while (windows.length > 0) {
      windows.shift().window.error(err);
    }
    this.destination.error(err);
  }
  
  _complete() {
    const windows = this.windows;
    while (windows.length > 0) {
      windows.shift().window.complete();
    }
    this.destination.complete();
  }
}