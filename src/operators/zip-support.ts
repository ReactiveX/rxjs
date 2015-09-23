import Operator from '../Operator';
import Observer from '../Observer';
import Scheduler from '../Scheduler';
import Observable from '../Observable';
import Subscriber from '../Subscriber';

import ArrayObservable from '../observables/ArrayObservable';

import tryCatch from '../util/tryCatch';
import {errorObject} from '../util/errorObject';
import OuterSubscriber from '../OuterSubscriber';
import subscribeToResult from '../util/subscribeToResult';

export class ZipOperator<T, R> implements Operator<T, R> {

  project: (...values: Array<any>) => R

  constructor(project?: (...values: Array<any>) => R) {
    this.project = project;
  }

  call(subscriber: Subscriber<R>): Subscriber<T> {
    return new ZipSubscriber<T, R>(subscriber, this.project);
  }
}

export class ZipSubscriber<T, R> extends OuterSubscriber<T, R> {

  values: any;
  active: number = 0;
  observables: Observable<any>[] = [];
  project: (...values: Array<any>) => R;
  limit: number = Number.POSITIVE_INFINITY;
  buffers: any[][] = [];
  
  constructor(destination: Subscriber<R>,
              project?: (...values: Array<any>) => R,
              values: any = Object.create(null)) {
    super(destination);
    this.project = (typeof project === "function") ? project : null;
    this.values = values;
  }

  _next(observable) {
    this.buffers.push([]);
    this.observables.push(observable);
  }

  _complete() {
    const values = this.values;
    const observables = this.observables;

    let index = -1;
    const len = observables.length;

    this.active = len;

    while(++index < len) {
      const observable = observables[index];
      this.add(subscribeToResult(this, observable, observable, index));
    }
  }

  notifyNext(value: R, observable: T, index: number, observableIndex: number) {
    const buffers = this.buffers;
    buffers[observableIndex].push(value);
    
    const len = buffers.length;
    for (let i = 0; i < len; i++) {
      let buffer = buffers[i];
      if(buffer.length === 0) {
        return;
      }
    }
    
    const outbound = [];
    const destination = this.destination;
    const project = this.project;
    
    for(let i = 0; i < len; i++) {
      outbound.push(buffers[i].shift());
    }
    
    if(project) {
      let result = tryCatch(project)(outbound);
      if(result === errorObject){
        destination.error(errorObject.e);
      } else {
        destination.next(result);
      }
    } else {
      destination.next(outbound);
    }
  }

  notifyComplete(innerSubscriber) {
    if((this.active -= 1) === 0) {
      this.destination.complete();
    } else {
      this.limit = innerSubscriber.events;
    }
  }
}

function arrayInitialize(length) {
  var arr = Array(length);
  for (let i = 0; i < length; i++) {
    arr[i] = null;
  }
  return arr;
}