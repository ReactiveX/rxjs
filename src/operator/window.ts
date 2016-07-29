import {Operator} from '../Operator';
import {ISubscriber, Subscriber} from '../Subscriber';
import {IObservable} from '../Observable';
import {Subject} from '../Subject';

import {OuterSubscriber} from '../OuterSubscriber';
import {InnerSubscriber} from '../InnerSubscriber';
import {subscribeToResult} from '../util/subscribeToResult';

/**
 * Branch out the source Observable values as a nested Observable whenever
 * `windowBoundaries` emits.
 *
 * <span class="informal">It's like {@link buffer}, but emits a nested Observable
 * instead of an array.</span>
 *
 * <img src="./img/window.png" width="100%">
 *
 * Returns an Observable that emits windows of items it collects from the source
 * Observable. The output Observable emits connected, non-overlapping
 * windows. It emits the current window and opens a new one whenever the
 * Observable `windowBoundaries` emits an item. Because each window is an
 * Observable, the output is a higher-order Observable.
 *
 * @example <caption>In every window of 1 second each, emit at most 2 click events</caption>
 * var clicks = Rx.Observable.fromEvent(document, 'click');
 * var interval = Rx.Observable.interval(1000);
 * var result = clicks.window(interval)
 *   .map(win => win.take(2)) // each window has at most 2 emissions
 *   .mergeAll(); // flatten the Observable-of-Observables
 * result.subscribe(x => console.log(x));
 *
 * @see {@link windowCount}
 * @see {@link windowTime}
 * @see {@link windowToggle}
 * @see {@link windowWhen}
 * @see {@link buffer}
 *
 * @param {Observable<any>} windowBoundaries An Observable that completes the
 * previous window and starts a new window.
 * @return {Observable<IObservable<T>>} An Observable of windows, which are
 * Observables emitting values of the source Observable.
 * @method window
 * @owner Observable
 */
export function window<T>(windowBoundaries: IObservable<any>): IObservable<IObservable<T>> {
  return this.lift(new WindowOperator<T>(windowBoundaries));
}

export interface WindowSignature<T> {
  (windowBoundaries: IObservable<any>): IObservable<IObservable<T>>;
}

class WindowOperator<T> implements Operator<T, IObservable<T>> {

  constructor(private windowBoundaries: IObservable<any>) {
  }

  call(subscriber: ISubscriber<IObservable<T>>, source: any): any {
    const windowSubscriber = new WindowSubscriber(subscriber);
    const sourceSubscription = source._subscribe(windowSubscriber);
    if (!sourceSubscription.closed) {
      windowSubscriber.add(subscribeToResult(windowSubscriber, this.windowBoundaries));
    }
    return sourceSubscription;
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class WindowSubscriber<T> extends OuterSubscriber<T, any> {

  private window: Subject<T> = new Subject<T>();

  constructor(destination: ISubscriber<IObservable<T>>) {
    super(destination);
    destination.next(this.window);
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

  protected _unsubscribe() {
    this.window = null;
  }

  private openWindow(): void  {
    const prevWindow = this.window;
    if (prevWindow) {
      prevWindow.complete();
    }
    const destination = this.destination;
    const newWindow = this.window = new Subject<T>();
    destination.next(newWindow);
  }
}
