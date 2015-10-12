import Operator from '../Operator';
import Observer from '../Observer';
import Subscriber from '../Subscriber';
import Observable from '../Observable';
import Subject from '../Subject';

import tryCatch from '../util/tryCatch';
import {errorObject} from '../util/errorObject';
import bindCallback from '../util/bindCallback';

export default function window<T>(closingNotifier: Observable<any>): Observable<Observable<T>> {
  return this.lift(new WindowOperator(closingNotifier));
}

class WindowOperator<T, R> implements Operator<T, R> {

  constructor(private closingNotifier: Observable<any>) {
  }

  call(subscriber: Subscriber<T>): Subscriber<T> {
    return new WindowSubscriber(subscriber, this.closingNotifier);
  }
}

class WindowSubscriber<T> extends Subscriber<T> {
  private window: Subject<T> = new Subject<T>();

  constructor(destination: Subscriber<T>, private closingNotifier: Observable<any>) {
    super(destination);
    this.add(closingNotifier._subscribe(new WindowClosingNotifierSubscriber(this)));
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
    const prevWindow = this.window;
    if (prevWindow) {
      prevWindow.complete();
    }
    this.destination.next(this.window = new Subject<T>());
  }
}

class WindowClosingNotifierSubscriber<T> extends Subscriber<T> {
  constructor(private parent: WindowSubscriber<any>) {
    super(null);
  }

  _next() {
    this.parent.openWindow();
  }

  _error(err: any) {
    this.parent._error(err);
  }

  _complete() {
    this.parent._complete();
  }
}