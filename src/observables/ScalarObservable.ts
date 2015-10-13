import Scheduler from '../Scheduler';
import Observable from '../Observable';
import tryCatch from '../util/tryCatch';
import { errorObject } from '../util/errorObject';
import ErrorObservable from './ErrorObservable';
import EmptyObservable from './EmptyObservable';

export default class ScalarObservable<T> extends Observable<T> {

  static create<T>(value: T, scheduler?: Scheduler) {
    return new ScalarObservable(value, scheduler);
  }

  static dispatch(state) {

    const { done, value, subscriber } = state;

    if (done) {
      subscriber.complete();
      return;
    }

    subscriber.next(value);

    if (subscriber.isUnsubscribed) {
      return;
    }

    state.done = true;

    (<any> this).schedule(state);
  }

  _isScalar: boolean = true;

  constructor(public value: T, private scheduler?: Scheduler) {
    super();
  }

  _subscribe(subscriber) {

    const value = this.value;
    const scheduler = this.scheduler;

    if (scheduler) {
      subscriber.add(scheduler.schedule(ScalarObservable.dispatch, 0, {
        done: false, value, subscriber
      }));
    } else {
      subscriber.next(value);
      if (!subscriber.isUnsubscribed) {
        subscriber.complete();
      }
    }
  }

  map<R>(project: (x: T, ix?: number) => R, thisArg?: any): Observable<R> {
    let result = tryCatch(project).call(thisArg || this, this.value, 0);
    if (result === errorObject) {
      return new ErrorObservable(errorObject.e);
    } else {
      return new ScalarObservable(project.call(thisArg || this, this.value, 0));
    }
  }

  filter(select: (x: T, ix?: number) => boolean, thisArg?: any): Observable<T> {
    let result = tryCatch(select).call(thisArg || this, this.value, 0);
    if (result === errorObject) {
      return new ErrorObservable(errorObject.e);
    } else if (result) {
      return this;
    } else {
      return new EmptyObservable();
    }
  }

  reduce<R>(project: (acc: R, x: T) => R, acc?: R): Observable<R> {
    if (typeof acc === 'undefined') {
      return <any>this;
    }
    let result = tryCatch(project)(acc, this.value);
    if (result === errorObject) {
      return new ErrorObservable(errorObject.e);
    } else {
      return new ScalarObservable(result);
    }
  }

  scan<R>(project: (acc: R, x: T) => R, acc?: R): Observable<R> {
    return this.reduce(project, acc);
  }

  count(): Observable<number> {
    return new ScalarObservable(1);
  }

  skip(count: number): Observable<T> {
    if (count > 0) {
      return new EmptyObservable();
    }
    return this;
  }

  take(count: number): Observable<T> {
    if (count > 0) {
      return this;
    }
    return new EmptyObservable();
  }
}
