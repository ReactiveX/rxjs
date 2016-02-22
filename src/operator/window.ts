import {Operator} from '../Operator';
import {Subscriber} from '../Subscriber';
import {Observable} from '../Observable';
import {Subject} from '../Subject';

import {OuterSubscriber} from '../OuterSubscriber';
import {InnerSubscriber} from '../InnerSubscriber';
import {subscribeToResult} from '../util/subscribeToResult';

/**
 * @param closingNotifier
 * @return {Observable<Observable<any>>|WebSocketSubject<T>|Observable<T>}
 * @method window
 * @owner Observable
 */
export function window<T>(closingNotifier: Observable<any>): Observable<Observable<T>> {
  return this.lift(new WindowOperator<T>(closingNotifier));
}

export interface WindowSignature<T> {
  (closingNotifier: Observable<any>): Observable<Observable<T>>;
}

class WindowOperator<T> implements Operator<T, Observable<T>> {

  constructor(private closingNotifier: Observable<any>) {
  }

  call(subscriber: Subscriber<Observable<T>>): Subscriber<T> {
    return new WindowSubscriber(subscriber, this.closingNotifier);
  }
}

class WindowSubscriber<T> extends OuterSubscriber<T, any> {
  private window: Subject<T>;

  constructor(protected destination: Subscriber<Observable<T>>,
              private closingNotifier: Observable<any>) {
    super(destination);
    this.add(subscribeToResult(this, closingNotifier));
    this.openWindow();
  }

  notifyNext(outerValue: T, innerValue: any,
             outerIndex: number, innerIndex: number,
             innerSub: InnerSubscriber<T, any>): void {
    this.openWindow();
  }

  notifyError(error: any, innerSub: InnerSubscriber<T, any>): void {
    this._error(error);
  }

  notifyComplete(innerSub: InnerSubscriber<T, any>): void {
    this._complete();
  }

  protected _next(value: T): void {
    this.window.next(value);
  }

  protected _error(err: any): void {
    this.window.error(err);
    this.destination.error(err);
  }

  protected _complete(): void {
    this.window.complete();
    this.destination.complete();
  }

  private openWindow(): void  {
    const prevWindow = this.window;
    if (prevWindow) {
      prevWindow.complete();
    }
    const destination = this.destination;
    const newWindow = this.window = new Subject<T>();
    destination.add(newWindow);
    destination.next(newWindow);
  }
}
