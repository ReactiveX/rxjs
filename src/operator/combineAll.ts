import try_catch from '../util/tryCatch';
import error_obj from '../util/errorObject';
import every from '../util/arrayEvery';
import Observer from '../Observer';
import Observable from '../Observable';
import Subscription from '../Subscription';
import SerialSubscription from '../SerialSubscription';
import CompositeSubscription from '../CompositeSubscription';

function getObserver(destination): Observer {
  return new CombineAllObserver(destination, this.project);
};

class CombineAllObserver extends Observer {

  active:Boolean = false;
  observables:Array<Observable> = [];
  project:Function = null;
  subscriptions:CompositeSubscription = new CompositeSubscription();

  constructor(destination, project) {
    super(destination);
    this.result = { done: false };
    this.project = project;
  }

  _next(observable) {
    this.observables.push(observable);
  }

  _return() {

    var result = this.result;
    var bucket = [];
    var project = this.project;
    var destination = this.destination;
    var observables = this.observables;
    var subscriptions = this.subscriptions;
    var args = [];
    var index = -1;
    var total = observables.length;

    while (++index < total) {
      var innerSubscription = new SerialSubscription();
      subscriptions.add(innerSubscription);
      innerSubscription.add(observables[index].subscribe(new CombineAllInnerObserver(this, project, bucket, index, total, innerSubscription)));
    }

    observables.length = 0;
    this.observables = null;
  }
  _combineAllInnerReturn(innerSubscription) {
    var subscriptions = this.subscriptions;
    subscriptions.remove(innerSubscription);
    if (subscriptions.length === 0) {
      return this.destination["return"]();
    }
  }
}

class CombineAllInnerObserver extends Observer {

  parent:CombineAllObserver;
  project:Function;
  bucket:Array<any>;
  index:number;
  total:number;
  subscription:Subscription;

  constructor(parent:CombineAllObserver, project:Function, bucket:Array<any>, index:number, total:number, subscription:Subscription) {
    super(parent.destination);
    this.result = { done: false };
    this.parent = parent;
    this.project = project;
    this.bucket = bucket;
    this.index = index;
    this.total = total;
    this.unsubscribed = false;
    this.subscription = subscription;
  }
  _next(value) {

    var parent = this.parent;
    var active = parent.active;
    var index = this.index;
    var total = this.total;
    var bucket = this.bucket;
    var result;

    (bucket[index] || (bucket[index] = []))[0] = value;

    if (active || (parent.active = bucket.length === total && every(bucket, hasValue))) {
      var project = this.project;
      if (typeof project === "function") {
        result = try_catch(this.project).apply(null, bucket.map(unboxValue));
        if (result === error_obj) {
          result = this.destination["throw"](error_obj.e);
        } else {
          result = this.destination.next(result);
        }
      } else {
        result = this.destination.next(bucket.map(unboxValue));
      }
    } else {
      result = this.result;
    }

    return result;
  }
  _return() {
    return this.parent._combineAllInnerReturn(this.subscription);
  }
}

function hasValue(xs) {
  return xs && xs.length > 0;
}

function unboxValue(xs) {
  return xs[0];
}

export default function combineAll(project:Function=null): Observable {
  return new this.constructor(this, { project: project, getObserver: getObserver });
};