import Operator from '../Operator';
import Observer from '../Observer';
import Observable from '../Observable';
import Subscriber from '../Subscriber';

import { MergeSubscriber, MergeInnerSubscriber } from './merge-support';
import EmptyObservable from '../observables/EmptyObservable';
import ScalarObservable from '../observables/ScalarObservable';

import tryCatch from '../util/tryCatch';
import {errorObject} from '../util/errorObject';

export default function expand<T>(project: (x: T, ix: number) => Observable<any>): Observable<any> {
  return this.lift(new ExpandOperator(project));
}

class ExpandOperator<T, R> implements Operator<T, R> {

  project: (x: T, ix: number) => Observable<any>;

  constructor(project: (x: T, ix: number) => Observable<any>) {
    this.project = project;
  }

  call(subscriber: Subscriber<R>): Subscriber<T> {
    return new ExpandSubscriber(subscriber, this.project);
  }
}

class ExpandSubscriber<T, R> extends MergeSubscriber<T, R> {

  project: (x: T, ix: number) => Observable<any>;

  constructor(destination: Observer<R>,
              project: (x: T, ix: number) => Observable<any>) {
    super(destination, Number.POSITIVE_INFINITY);
    this.project = project;
  }

  _project(value, index) {
    const observable = tryCatch(this.project).call(this, value, index);
    if (observable === errorObject) {
      this.error(errorObject.e);
      return null;
    }
    return observable;
  }

  _subscribeInner(observable, value, index) {
    if(observable._isScalar) {
      this.destination.next((<ScalarObservable<T>> observable).value);
      this._innerComplete();
      this._next((<any>observable).value);
    } else if(observable instanceof EmptyObservable) {
      this._innerComplete();
    } else {
      return observable._subscribe(new ExpandInnerSubscriber(this.destination, this));
    }
  }
}

class ExpandInnerSubscriber<T, R> extends MergeInnerSubscriber<T, R> {
  constructor(destination: Observer<T>, parent: ExpandSubscriber<T, R>) {
    super(destination, parent);
  }
  _next(value) {
    this.destination.next(value);
    this.parent.next(value);
  }
}
