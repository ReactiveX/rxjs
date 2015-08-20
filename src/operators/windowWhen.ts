import Operator from '../Operator';
import Observer from '../Observer';
import Subscriber from '../Subscriber';
import Observable from '../Observable';
import Subject from '../Subject';
import Subscription from '../Subscription';

import tryCatch from '../util/tryCatch';
import {errorObject} from '../util/errorObject';
import bindCallback from '../util/bindCallback';

export default function window<T>(closingSelector: () => Observable<any>) : Observable<Observable<T>> {
  return this.lift(new WindowOperator(closingSelector));
}

export class WindowOperator<T, R> implements Operator<T, R> {

  constructor(private closingSelector: () => Observable<any>) {
  }

  call(observer: Observer<T>): Observer<T> {
    return new WindowSubscriber(observer, this.closingSelector);
  }
}

export class WindowSubscriber<T> extends Subscriber<T> {
  private window: Subject<T> = new Subject<T>();
  private closingNotification: Subscription<any>;
  
  constructor(destination: Observer<T>, private closingSelector: () => Observable<any>) {
    super(destination);
    this.openWindow();
  }

  _next(value: T) {
    this.window.next(value);
  }
  
  _error(err: any) {
    this.window.error(err);
    this.destination.error(err);
  }
  
  _complete() {
    this.window.complete();
    this.destination.complete();
  }
  
  openWindow() {
    const prevClosingNotification = this.closingNotification;
    if (prevClosingNotification) {
      this.remove(prevClosingNotification);
      prevClosingNotification.unsubscribe();
    }
    
    const prevWindow = this.window;
    if (prevWindow) {
      prevWindow.complete();
    }

    this.destination.next(this.window = new Subject<T>());
    
    let closingNotifier = tryCatch(this.closingSelector)();
    if (closingNotifier === errorObject) {
      const err = closingNotifier.e;
      this.destination.error(err);
      this.window.error(err);
    } else {
      this.add(this.closingNotification = closingNotifier.subscribe(new WindowClosingNotifierSubscriber(this))); 
    }
  }
}

export class WindowClosingNotifierSubscriber<T> extends Subscriber<T> {
  constructor(private parent: WindowSubscriber<any>) {
    super(null);
  }
  
  _next() {
    this.parent.openWindow();
  }
  
  _error(err) {
    this.parent.error(err);
  }
  
  _complete() {
    // noop
  }
}