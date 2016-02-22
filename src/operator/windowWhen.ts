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
 * @param closingSelector
 * @return {Observable<Observable<any>>|WebSocketSubject<T>|Observable<T>}
 * @method windowWhen
 * @owner Observable
 */
export function windowWhen<T>(closingSelector: () => Observable<any>): Observable<Observable<T>> {
  return this.lift(new WindowOperator<T>(closingSelector));
}

export interface WindowWhenSignature<T> {
  (closingSelector: () => Observable<any>): Observable<Observable<T>>;
}

class WindowOperator<T> implements Operator<T, Observable<T>> {
  constructor(private closingSelector: () => Observable<any>) {
  }

  call(subscriber: Subscriber<Observable<T>>): Subscriber<T> {
    return new WindowSubscriber(subscriber, this.closingSelector);
  }
}

class WindowSubscriber<T> extends OuterSubscriber<T, any> {
  private window: Subject<T>;
  private closingNotification: Subscription;

  constructor(protected destination: Subscriber<Observable<T>>,
              private closingSelector: () => Observable<any>) {
    super(destination);
    this.openWindow();
  }

  notifyNext(outerValue: T, innerValue: any,
             outerIndex: number, innerIndex: number,
             innerSub: InnerSubscriber<T, any>): void {
    this.openWindow(innerSub);
  }

  notifyError(error: any, innerSub: InnerSubscriber<T, any>): void {
    this._error(error);
  }

  notifyComplete(innerSub: InnerSubscriber<T, any>): void {
    this.openWindow(innerSub);
  }

  protected _next(value: T): void {
    this.window.next(value);
  }

  protected _error(err: any): void {
    this.window.error(err);
    this.destination.error(err);
    this.unsubscribeClosingNotification();
  }

  protected _complete(): void {
    this.window.complete();
    this.destination.complete();
    this.unsubscribeClosingNotification();
  }

  private unsubscribeClosingNotification(): void {
    if (this.closingNotification) {
      this.closingNotification.unsubscribe();
    }
  }

  private openWindow(innerSub: InnerSubscriber<T, any> = null): void {
    if (innerSub) {
      this.remove(innerSub);
      innerSub.unsubscribe();
    }

    const prevWindow = this.window;
    if (prevWindow) {
      prevWindow.complete();
    }

    const window = this.window = new Subject<T>();
    this.destination.next(window);

    const closingNotifier = tryCatch(this.closingSelector)();
    if (closingNotifier === errorObject) {
      const err = errorObject.e;
      this.destination.error(err);
      this.window.error(err);
    } else {
      this.add(this.closingNotification = subscribeToResult(this, closingNotifier));
      this.add(window);
    }
  }
}