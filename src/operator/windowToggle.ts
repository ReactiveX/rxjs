import {Operator} from '../Operator';
import {Subscriber} from '../Subscriber';
import {Observable} from '../Observable';
import {Subject} from '../Subject';
import {Subscription} from '../Subscription';

import {tryCatch} from '../util/tryCatch';
import {errorObject} from '../util/errorObject';

import {OuterSubscriber} from '../OuterSubscriber';
import {InnerSubscriber} from '../InnerSubscriber';
import {subscribeToResult} from '../util/subscribeToResult';

/**
 * @param openings
 * @param closingSelector
 * @return {Observable<Observable<any>>|WebSocketSubject<T>|Observable<T>}
 * @method windowToggle
 * @owner Observable
 */
export function windowToggle<T, O>(openings: Observable<O>,
                                   closingSelector: (openValue: O) => Observable<any>): Observable<Observable<T>> {
  return this.lift(new WindowToggleOperator<T, O>(openings, closingSelector));
}

export interface WindowToggleSignature<T> {
  <O>(openings: Observable<O>, closingSelector: (openValue: O) => Observable<any>): Observable<Observable<T>>;
}

class WindowToggleOperator<T, O> implements Operator<T, Observable<T>> {

  constructor(private openings: Observable<O>,
              private closingSelector: (openValue: O) => Observable<any>) {
  }

  call(subscriber: Subscriber<Observable<T>>): Subscriber<T> {
    return new WindowToggleSubscriber(
      subscriber, this.openings, this.closingSelector
    );
  }
}

interface WindowContext<T> {
  window: Subject<T>;
  subscription: Subscription;
}

class WindowToggleSubscriber<T, O> extends OuterSubscriber<T, any> {
  private contexts: WindowContext<T>[] = [];
  private openSubscription: Subscription;

  constructor(destination: Subscriber<Observable<T>>,
              private openings: Observable<O>,
              private closingSelector: (openValue: O) => Observable<any>) {
    super(destination);
    this.add(this.openSubscription = subscribeToResult(this, openings, openings));
  }

  protected _next(value: T) {
    const { contexts } = this;
    if (contexts) {
      const len = contexts.length;
      for (let i = 0; i < len; i++) {
        contexts[i].window.next(value);
      }
    }
  }

  protected _error(err: any) {

    const { contexts } = this;
    this.contexts = null;

    if (contexts) {
      const len = contexts.length;
      let index = -1;

      while (++index < len) {
        const context = contexts[index];
        context.window.error(err);
        context.subscription.unsubscribe();
      }
    }

    super._error(err);
  }

  protected _complete() {
    const { contexts } = this;
    this.contexts = null;
    if (contexts) {
      const len = contexts.length;
      let index = -1;
      while (++index < len) {
        const context = contexts[index];
        context.window.complete();
        context.subscription.unsubscribe();
      }
    }
    super._complete();
  }

  protected _unsubscribe() {
    const { contexts } = this;
    this.contexts = null;
    if (contexts) {
      const len = contexts.length;
      let index = -1;
      while (++index < len) {
        const context = contexts[index];
        context.window.unsubscribe();
        context.subscription.unsubscribe();
      }
    }
  }

  notifyNext(outerValue: any, innerValue: any,
             outerIndex: number, innerIndex: number,
             innerSub: InnerSubscriber<T, any>): void {

    if (outerValue === this.openings) {

      const { closingSelector } = this;
      const closingNotifier = tryCatch(closingSelector)(innerValue);

      if (closingNotifier === errorObject) {
        return this.error(errorObject.e);
      } else {
        const window = new Subject<T>();
        const subscription = new Subscription();
        const context = { window, subscription };
        this.contexts.push(context);
        const innerSubscription = subscribeToResult(this, closingNotifier, context);

        if (innerSubscription.isUnsubscribed) {
          this.closeWindow(this.contexts.length - 1);
        } else {
          (<any> innerSubscription).context = context;
          subscription.add(innerSubscription);
        }

        this.destination.next(window);

      }
    } else {
      this.closeWindow(this.contexts.indexOf(outerValue));
    }
  }

  notifyError(err: any): void {
    this.error(err);
  }

  notifyComplete(inner: Subscription): void {
    if (inner !== this.openSubscription) {
      this.closeWindow(this.contexts.indexOf((<any> inner).context));
    }
  }

  private closeWindow(index: number): void {
    if (index === -1) {
      return;
    }

    const { contexts } = this;
    const context = contexts[index];
    const { window, subscription } = context;
    contexts.splice(index, 1);
    window.complete();
    subscription.unsubscribe();
  }
}
