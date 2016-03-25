import {Operator} from '../Operator';
import {Observable} from '../Observable';
import {Subscriber} from '../Subscriber';

import {OuterSubscriber} from '../OuterSubscriber';
import {InnerSubscriber} from '../InnerSubscriber';
import {subscribeToResult} from '../util/subscribeToResult';

/**
 * @param notifier
 * @return {Observable<R>|WebSocketSubject<T>|Observable<T>}
 * @method takeUntil
 * @owner Observable
 */
export function takeUntil<T>(notifier: Observable<any>): Observable<T> {
  return this.lift(new TakeUntilOperator(notifier));
}

export interface TakeUntilSignature<T> {
  (notifier: Observable<any>): Observable<T>;
}

class TakeUntilOperator<T> implements Operator<T, T> {
  constructor(private notifier: Observable<any>) {
  }

  call(subscriber: Subscriber<T>, source: any): any {
    return source._subscribe(new TakeUntilSubscriber(subscriber, this.notifier));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class TakeUntilSubscriber<T, R> extends OuterSubscriber<T, R> {

  constructor(destination: Subscriber<any>,
              private notifier: Observable<any>) {
    super(destination);
    this.add(subscribeToResult(this, notifier));
  }

  notifyNext(outerValue: T, innerValue: R,
             outerIndex: number, innerIndex: number,
             innerSub: InnerSubscriber<T, R>): void {
    this.complete();
  }

  notifyComplete(): void {
    // noop
  }
}
