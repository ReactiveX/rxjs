import Operator from '../Operator';
import Observer from '../Observer';
import Scheduler from '../Scheduler';
import Observable from '../Observable';
import Subscriber from '../Subscriber';
import InnerSubscriber from '../InnerSubscriber';
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
  buffers: any[][] = [];
  completed: boolean[] = [];
  
  constructor(destination: Subscriber<R>,
              project?: (...values: Array<any>) => R,
              values: any = Object.create(null)) {
    super(destination);
    this.project = (typeof project === "function") ? project : null;
    this.values = values;
  }

  _next(observable) {
    this.buffers.push([]);
    this.completed.push(false);
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
    const destination = this.destination;
    const completed = this.completed;
    
    for (let i = 0; i < len; i++) {
      if(buffers[i].length === 0) {
        if(completed[i]) {
          destination.complete();
        }
        return;
      }
    }
    
    const args = [];
    const project = this.project;
    let shouldComplete = false;
    
    for(let i = 0; i < len; i++) {
      args.push(buffers[i].shift());
      if(buffers[i].length === 0 && completed[i]) {
        shouldComplete = true;
      }
    }
    
    if(project) {
      let result = tryCatch(project).apply(this, args);
      if(result === errorObject){
        destination.error(errorObject.e);
      } else {
        destination.next(result);
      }
    } else {
      destination.next(args);
    }
    
    if(shouldComplete) {
      destination.complete();
    }
  }

  notifyComplete(innerSubscriber: InnerSubscriber<T, R>) {
    this.completed[innerSubscriber.outerIndex] = true;
    if((this.active -= 1) === 0) {
      this.destination.complete();
    }
  }
}