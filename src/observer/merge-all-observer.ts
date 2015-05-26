import Observer from './observer';
import CompositeSubscription from '../subscription/composite-subscription';
import SubscriptionReference from '../subscription/subscription-reference';
import { Observable } from '../observable/observable';
import Subscription from '../subscription/subscription';

export default class MergeAllObserver extends Observer<Observable<any>> {
  private _compositeSubscription:CompositeSubscription
  
  public canReturn: Boolean

  protected returnValue: any

  constructor(generator:Generator<any>, subscription:Subscription) {
    super(generator, subscription);
    this._compositeSubscription = new CompositeSubscription();
  }

  completed(subscription) : IteratorResult<any> {
    this._compositeSubscription.remove(subscription);
    return this.checkReturn();
  }

  checkReturn() : IteratorResult<any> {
    if(this.canReturn && this._compositeSubscription.length === 0) {
      return this.generator.return(this.returnValue);
    }
  }

  next(observable:Observable<any>) : IteratorResult<any> {
    var subscription = new SubscriptionReference();
    this._compositeSubscription.add(subscription);
    var sub;
    try {
      sub = observable.observer(new MergedObservableObserver<any>(this, subscription));
    } catch(err) {
      super.throw(err);
    }
    subscription.setSubscription(sub);

    return { done: false, value: undefined }; //NOTE: should value be subscription?
  }

  return(value:any) : IteratorResult<any> {
    this.canReturn = true;
    this.returnValue = value;
    return this.checkReturn();
  }
}

export class MergedObservableObserver<T> extends Observer<T> {
  private _source: MergeAllObserver;

  constructor(source, subscription) {
    super(source.generator, subscription);
    this._source = source;
  }

  return():IteratorResult<T> {
    return this._source.completed(this.subscription);
  }
}