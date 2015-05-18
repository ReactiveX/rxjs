import Subscription from './subscription';

export default class SubscriptionReference extends Subscription {
  
  protected subscription:Subscription
  
  private _isDisposed:Boolean
  
  private _isDisposeScheduled:Boolean
  
  public isReference:Boolean = true


  constructor(subscription:Subscription=null) {
    super(null);
    this.subscription = subscription;
    this._isDisposeScheduled = false;
    this._isDisposed = false;
  }

  get value() {
    return this.subscription;
  }

  set value(subcription) {
    this.setSubscription(subcription);
  }

  get isDisposed() {
    return this._isDisposeScheduled || this._isDisposed;
  }

  setSubscription(subscription) {
    this.subscription = subscription;
    if(this._isDisposeScheduled) {
      this._dispose();
    }
  }

  _dispose() {
    this.subscription.dispose();
    this._isDisposeScheduled = false;
    this._isDisposed = true;
  }

  dispose() {
    if(!this.subscription) {
      this._isDisposeScheduled = true;
    }
    else {
      this._dispose();
    }
  }
}