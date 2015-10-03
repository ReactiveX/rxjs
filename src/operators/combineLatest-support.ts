import Operator from '../Operator';
import Observer from '../Observer';
import Observable from '../Observable';
import Subscriber from '../Subscriber';

import ArrayObservable from '../observables/ArrayObservable';
import EmptyObservable from '../observables/EmptyObservable';

import tryCatch from '../util/tryCatch';
import {errorObject} from '../util/errorObject';
import OuterSubscriber from '../OuterSubscriber';
import subscribeToResult from '../util/subscribeToResult';

export class CombineLatestOperator<T, R> implements Operator<T, R> {

  project: (...values: Array<any>) => R;

  constructor(project?: (...values: Array<any>) => R) {
    this.project = project;
  }

  call(subscriber: Subscriber<R>): Subscriber<T> {
    return new CombineLatestSubscriber<T, R>(subscriber, this.project);
  }
}

export class CombineLatestSubscriber<T, R> extends OuterSubscriber<T, R> {
  private active: number = 0;
  private values: any[] = [];
  private observables: any[] = [];
  private toRespond: number[] = [];

  constructor(destination: Subscriber<R>, private project?: (...values: Array<any>) => R) {
    super(destination);
  }

  _next(observable: any) {
    const toRespond = this.toRespond;
    toRespond.push(toRespond.length);
    this.observables.push(observable);
  }

  _complete() {
    const observables = this.observables;
    const len = observables.length;
    if (len === 0) {
      this.destination.complete();
    } else {
      this.active = len;
      for (let i = 0; i < len; i++) {
        let observable = observables[i];
        this.add(subscribeToResult(this, observable, observable, i));
      }
    }
  }

  notifyComplete(innerSubscriber) {
    if ((this.active -= 1) === 0) {
      this.destination.complete();
    }
  }

  notifyNext(observable: any, value: R, outerIndex: number, innerIndex: number) {
    const values = this.values;
    values[outerIndex] = value;
    const toRespond = this.toRespond;

    if (toRespond.length > 0) {
      const found = toRespond.indexOf(outerIndex);
      if (found !== -1) {
        toRespond.splice(found, 1);
      }
    }

    if (toRespond.length === 0) {
      const project = this.project;
      const destination = this.destination;

      if (project) {
        let result = tryCatch(project).apply(this, values);
        if (result === errorObject) {
          destination.error(errorObject.e);
        } else {
          destination.next(result);
        }
      } else {
        destination.next(values);
      }
    }
  }
}
