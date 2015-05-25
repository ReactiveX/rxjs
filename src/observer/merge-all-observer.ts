import Observer from './observer';
import CompositeSubscription from '../subscription/composite-subscription';
import SubscriptionReference from '../subscription/subscription-reference';
import { Observable } from '../observable/observable';

export default class MergeAllObserver<T> extends Observer<T> {
  private _compositeSubscription:CompositeSubscription
  
  public canReturn: Boolean

  protected returnValue: T

  constructor(generator, subscription) {
    super(generator, subscription);
    this._compositeSubscription = new CompositeSubscription();
  }

  completed(subscription) : IteratorResult<T> {
    this._compositeSubscription.remove(subscription);
    return this.checkReturn();
  }

  checkReturn() : IteratorResult<T> {
    if(this.canReturn && this._compositeSubscription.length === 0) {
      return this.generator.return(this.returnValue);
    }
  }

  next(observable:Observable<T>) : IteratorResult<Observable<T>> {
    var subscription = new SubscriptionReference();
    this._compositeSubscription.add(subscription);
    var sub;
    try {
      sub = observable.observer(new MergedObservableObserver<T>(this, subscription));
    } catch(err) {
      super.throw(err);
    }
    subscription.setSubscription(sub);

    return { done: false, value: <Observable<T>>undefined };
  }

  return(value) {
    this.canReturn = true;
    this.returnValue = value;
    return this.checkReturn();
  }
}

export class MergedObservableObserver<T> extends Observer<T> {
  private _source: MergeAllObserver<T>

  constructor(source, subscription) {
    super(source._generator, subscription);
    this._source = source;
  }

  return():IteratorResult<T> {
    return this._source.completed(this.subscription);
  }
}