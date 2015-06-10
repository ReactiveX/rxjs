import Observer from '../Observer';
import Subscription from '../Subscription';
import SerialSubscription from '../SerialSubscription';
import CompositeSubscription from '../CompositeSubscription';
import OperatorObservable from '../OperatorObservable';

interface IteratorResult<T> {
  value?:T;
  done:boolean;
}

function getObserver(destination) {
    return new MergeAllObserver(destination, this.concurrent);
};

class MergeAllObserver extends Observer {
  buffer:Array<any>;
  concurrent:number = Number.POSITIVE_INFINITY;
  stopped:boolean = false;
  subscriptions:CompositeSubscription = new CompositeSubscription();
  
  constructor(destination:Observer, concurrent:number) {
    super(destination);
    if (typeof concurrent != 'number' || concurrent !== concurrent || concurrent < 1) {
        this.concurrent = Number.POSITIVE_INFINITY;
    } else {
        this.buffer = [];
        this.concurrent = concurrent;
    }
  }
  
  _next(observable):IteratorResult<any> {
    var buffer = this.buffer;
    var concurrent = this.concurrent;
    var subscriptions = this.subscriptions;

    if (subscriptions.length < concurrent) {
        var innerSubscription = new SerialSubscription(null);
        subscriptions.add(innerSubscription);
        innerSubscription.add(observable.subscribe(new MergeInnerObserver(this, innerSubscription)));
    } else if (buffer) {
        buffer.push(observable);
    }
    
    return { done: false };
  }
  
  _return() : IteratorResult<any> {
    var buffer = this.buffer;
    var subscriptions = this.subscriptions;
    this.stopped = true;

    if (subscriptions.length === 0 && (!buffer || buffer.length === 0)) {
        return this.destination["return"]();
    }
    
    return { done: true };
  }
  
  _innerReturn(innerSubscription:Subscription) : IteratorResult<any> {
    var buffer = this.buffer;
    var subscriptions = this.subscriptions;
    var length = subscriptions.length - 1;

    subscriptions.remove(innerSubscription);

    if(length < this.concurrent) {
        if (buffer && buffer.length > 0) {
            this.next(buffer.shift());
        } else if (length === 0 && this.stopped) {
            return this.destination["return"]();
        }
    }
    return { done: true };
  }
}

class MergeInnerObserver extends Observer {
  parent:MergeAllObserver;
  subscription:Subscription;
  
  constructor(parent:MergeAllObserver, subscription:Subscription) {
    super(parent.destination);
    this.parent = parent;
    this.subscription = subscription;
  }
}

MergeInnerObserver.prototype = Object.create(Observer.prototype);

MergeInnerObserver.prototype._return = function _mergeInnerReturn() {
    return this.parent._innerReturn(this.subscription);
};

export default function mergeAll(concurrent:number=Number.POSITIVE_INFINITY) : OperatorObservable {
    return new this.constructor(this, { concurrent: concurrent, getObserver: getObserver });
};