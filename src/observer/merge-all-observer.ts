import Observer from './observer';
import CompositeSubscription from '../subscription/composite-subscription';
import SubscriptionReference from '../subscription/subscription-reference';

export default class MergeAllObserver extends Observer {
  constructor(generator, subscriptionRef) {
    super(generator, subscriptionRef);
    this._compositeSubscription = new CompositeSubscription();
  }

  completed(subscriptionRef) {
    this._compositeSubscription.remove(subscriptionRef);
    this.checkReturn();
  }

  checkReturn() {
    if(this.canReturn && this._compositeSubscription.length === 0) {
      var _return = this._generator.return;
      if(_return) {
        _return.call(this, this.returnValue);
      }
    }
  }

  next(observable) {
    var subscriptionRef = new SubscriptionReference();
    this._compositeSubscription.add(subscriptionRef);
    var sub;
    try {
      sub = observable.observer(new MergedObservableObserver(this, subscriptionRef));
    } catch(err) {
      super.throw(err);
    }
    subscriptionRef.setSubscription(sub);
  }

  return(value) {
    this.canReturn = true;
    this.returnValue = value;
    return this.checkReturn();
  }
}

export class MergedObservableObserver extends Observer {
  constructor(source, subscriptionRef) {
    super(source._generator, subscriptionRef);
    this._source = source;
  }

  return() {
    this._source.completed(this._subscriptionDisposable);
  }
}