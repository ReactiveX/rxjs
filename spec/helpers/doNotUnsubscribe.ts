///<reference path='../../typings/index.d.ts'/>
import * as Rx from '../../dist/cjs/Rx';

export function doNotUnsubscribe<T>(ob: Rx.Observable<T>): Rx.Observable<T> {
  return ob.lift(new DoNotUnsubscribeOperator());
}

class DoNotUnsubscribeOperator<T, R> implements Rx.Operator<T, R> {
  call(subscriber: Rx.Subscriber<R>, source: any): any {
    return source.subscribe(new DoNotUnsubscribeSubscriber(subscriber));
  }
}

class DoNotUnsubscribeSubscriber<T> extends Rx.Subscriber<T> {
  unsubscribe() {} // tslint:disable-line no-empty
}