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
}

// TypeScript is weird about class prototype member functions and instance properties touching on it's plate.
const proto = ScalarObservable.prototype;

proto.map = function <T, R>(project: (x: T, ix?: number) => R, thisArg?: any): Observable<R> {
  let result = tryCatch(project).call(thisArg || this, this.value, 0);
  if (result === errorObject) {
    return new ErrorObservable(errorObject.e);
  } else {
    return new ScalarObservable(project.call(thisArg || this, this.value, 0));
  }
};

proto.filter = function <T>(select: (x: T, ix?: number) => boolean, thisArg?: any): Observable<T> {
  let result = tryCatch(select).call(thisArg || this, this.value, 0);
  if (result === errorObject) {
    return new ErrorObservable(errorObject.e);
  } else if (result) {
    return this;
  } else {
    return new EmptyObservable();
  }
};

proto.reduce = function <T, R>(project: (acc: R, x: T) => R, acc?: R): Observable<R> {
  if (typeof acc === 'undefined') {
    return <any>this;
  }
  let result = tryCatch(project)(acc, this.value);
  if (result === errorObject) {
    return new ErrorObservable(errorObject.e);
  } else {
    return new ScalarObservable(result);
  }
};

proto.scan = function <T, R>(project: (acc: R, x: T) => R, acc?: R): Observable<R> {
  return this.reduce(project, acc);
};

proto.count = function <T>(predicate?: (value: T, index: number, source: Observable<T>) => boolean, thisArg?: any): Observable<number> {
  if (!predicate) {
    return new ScalarObservable(1);
  } else {
    let result = tryCatch(predicate).call(thisArg || this, this.value, 0, this);
    if (result === errorObject) {
      return new ErrorObservable(errorObject.e);
    } else {
      return new ScalarObservable(result ? 1 : 0);
    }
  }
};

proto.skip = function <T>(count: number): Observable<T> {
  if (count > 0) {
    return new EmptyObservable();
  }
  return this;
};

proto.take = function <T>(count: number): Observable<T> {
  if (count > 0) {
    return this;
  }
  return new EmptyObservable();
};
