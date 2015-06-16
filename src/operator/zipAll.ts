import try_catch from '../util/tryCatch';
import error_obj from '../util/errorObject';
import every from '../util/arrayEvery';
import Observer from '../Observer';
import Observable from '../Observable';
import Subscription from '../Subscription';
import SerialSubscription from '../SerialSubscription';
import CompositeSubscription from '../CompositeSubscription';

function getObserver(destination): Observer {
  return new ZipAllObserver(destination, this.project);
};

class ZipAllObserver extends Observer {
  limit:number = Number.POSITIVE_INFINITY;
  finished:number = 0;
  project:Function = null;
  observables:Array<Observable> = [];
  subscriptions:CompositeSubscription = new CompositeSubscription();

  constructor(destination, project:Function=null) {
    super(destination);
    this.result = { done: false };
    this.project = project;
  }
  _next(observable) {
    this.observables.push(observable);
  }
  _return() {

    var buckets = [];
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
      innerSubscription.add(observables[index].subscribe(new ZipAllInnerObserver(this, project, buckets, index, total, innerSubscription)));
    }

    observables.length = 0;
    this.observables = null;
  }
  _zipAllInnerReturn(child, innerSubscription) {
    var subscriptions = this.subscriptions;
    this.limit = child.count;
    subscriptions.remove(innerSubscription);
    if (subscriptions.length === 0) {
      return this.destination["return"]();
    }
  }
};

class ZipAllInnerObserver extends Observer {
  parent:ZipAllObserver;
  project:Function = null;
  buckets:Array<any>;
  index:number;
  total:number;
  count:number = 0;
  length:number = 0;
  subscription:Subscription;

  constructor(parent:ZipAllObserver, project:Function, buckets:Array<any>, index:number, total:number, subscription:Subscription) {
    super(parent.destination);
    this.result = { done: false };
    this.parent = parent;
    this.project = project;
    this.buckets = buckets;
    this.index = index;
    this.total = total;
    this.count = 0;
    this.length = 0;
    this.subscription = subscription;
  }
  _next(value) {

    var limit = this.parent.limit;
    var index = this.index;
    var total = this.total;
    var count = this.count++;
    var result;

    if (count > limit) {
      result = this["return"]();
    } else {

      var buckets = this.buckets;
      var bucket = buckets[count] || (buckets[count] = []);
      bucket[index] = [value];

      if (bucket.length === total && every(bucket, hasValue)) {
        var project = this.project;
        if (typeof project === "function") {
          result = try_catch(this.project).apply(null, bucket.map(unboxValue));
          if (result === error_obj) {
            return this.destination["throw"](error_obj.e);
          } else {
            result = this.destination.next(result);
          }
        } else {
          result = this.destination.next(bucket.map(unboxValue));
        }
        bucket.length = 0;
        buckets[count] = undefined;
      } else {
        result = this.result;
      }
    }

    return result;
  }
  _return() {
    return this.parent._zipAllInnerReturn(this, this.subscription);
  }
};

function hasValue(xs) {
  return xs && xs.length > 0;
}

function unboxValue(xs) {
  return xs[0];
}

export default function zipAll(project: Function = null): Observable {
  return new this.constructor(this, { project: project, getObserver: getObserver });
};