import Subscription from './subscription';

export default class SubscriptionReference extends Subscription {

  protected subscription:Subscription

  _isDisposed:boolean

  _isDisposeScheduled:boolean

  public isReference:boolean = true


  constructor(subscription:Subscription=null) {
    super(null);
    this.subscription = subscription;
    this._isDisposeScheduled = false;
    this._isDisposed = false;
  }

  get value():Subscription {
    return this.subscription;
  }

  set value(subcription:Subscription) {
    this.setSubscription(subcription);
  }

  get isDisposed():boolean {
    return this._isDisposeScheduled || this._isDisposed;
  }

  set isDisposed(v:boolean) {
    this._isDisposed = v;
  }

  setSubscription(subscription:Subscription) : void {
    this.subscription = subscription;
    if(this._isDisposeScheduled) {
      this._dispose();
    }
  }

  _dispose():void {
    this.subscription.dispose();
    this._isDisposeScheduled = false;
    this._isDisposed = true;
  }

  dispose():void {
    if(!this.subscription) {
      this._isDisposeScheduled = true;
    }
    else {
      this._dispose();
    }
  }
}