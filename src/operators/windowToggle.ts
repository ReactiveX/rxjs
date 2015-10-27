import Operator from '../Operator';
import Subscriber from '../Subscriber';
import Observable from '../Observable';
import Subject from '../Subject';
import Subscription from '../Subscription';

import tryCatch from '../util/tryCatch';
import {errorObject} from '../util/errorObject';

export default function windowToggle<T, O>(openings: Observable<O>,
                                           closingSelector: (openValue: O) => Observable<any>): Observable<Observable<T>> {
  return this.lift(new WindowToggleOperator<T, T, O>(openings, closingSelector));
}

class WindowToggleOperator<T, R, O> implements Operator<T, R> {

  constructor(private openings: Observable<O>,
              private closingSelector: (openValue: O) => Observable<any>) {
  }

  call(subscriber: Subscriber<T>): Subscriber<T> {
    return new WindowToggleSubscriber<T, O>(
      subscriber, this.openings, this.closingSelector
    );
  }
}

interface WindowContext<T> {
  window: Subject<T>;
  subscription: Subscription<T>;
}

class WindowToggleSubscriber<T, O> extends Subscriber<T> {
  private contexts: Array<WindowContext<T>> = [];

  constructor(destination: Subscriber<T>,
              private openings: Observable<O>,
              private closingSelector: (openValue: O) => Observable<any>) {
    super(destination);
    this.add(this.openings._subscribe(new WindowToggleOpeningsSubscriber(this)));
  }

  _next(value: T) {
    const contexts = this.contexts;
    const len = contexts.length;
    for (let i = 0; i < len; i++) {
      contexts[i].window.next(value);
    }
  }

  _error(err: any) {
    const contexts = this.contexts;
    while (contexts.length > 0) {
      contexts.shift().window.error(err);
    }
    this.destination.error(err);
  }

  _complete() {
    const contexts = this.contexts;
    while (contexts.length > 0) {
      const context = contexts.shift();
      context.window.complete();
      context.subscription.unsubscribe();
    }
    this.destination.complete();
  }

  openWindow(value: O) {
    const closingSelector = this.closingSelector;
    let closingNotifier = tryCatch(closingSelector)(value);
    if (closingNotifier === errorObject) {
      this.error(closingNotifier.e);
    } else {
      let context = {
        window: new Subject<T>(),
        subscription: new Subscription()
      };
      this.contexts.push(context);
      this.destination.next(context.window);
      const subscriber = new WindowClosingNotifierSubscriber<T, O>(this, context);
      const subscription = closingNotifier._subscribe(subscriber);
      this.add(context.subscription.add(subscription));
    }
  }

  closeWindow(context: WindowContext<T>) {
    const { window, subscription } = context;
    const contexts = this.contexts;
    contexts.splice(contexts.indexOf(context), 1);
    window.complete();
    this.remove(subscription);
    subscription.unsubscribe();
  }
}

class WindowClosingNotifierSubscriber<T, O> extends Subscriber<T> {
  constructor(private parent: WindowToggleSubscriber<T, O>,
              private windowContext: { window: Subject<T>, subscription: Subscription<T> }) {
    super(null);
  }

  _next() {
    this.parent.closeWindow(this.windowContext);
  }

  _error(err) {
    this.parent.error(err);
  }

  _complete() {
    this.parent.closeWindow(this.windowContext);
  }
}

class WindowToggleOpeningsSubscriber<T> extends Subscriber<T> {
  constructor(private parent: WindowToggleSubscriber<any, T>) {
    super();
  }

  _next(value: T) {
    this.parent.openWindow(value);
  }

  _error(err) {
    this.parent.error(err);
  }

  _complete() {
    // noop
  }
}