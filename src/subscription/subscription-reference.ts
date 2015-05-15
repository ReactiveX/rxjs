export default class SubscriptionReference {
  constructor(subscription) {
    this._subscription = subscription;
    this._isDisposeScheduled = false;
    this._isDisposed = false;
  }

  get value() {
    return this._subscription;
  }

  set value(subcription) {
    this.setSubscription(subcription);
  }
  
  get isDisposed() {
    return this._isDisposeScheduled || this._isDisposed;
  }

  setSubscription(subscription) {
    this._subscription = subscription;
    if(this._isDisposeScheduled) {
      this._dispose();
    }
  }

  _dispose() {
    this._subscription.dispose();
    this._isDisposeScheduled = false;
    this._isDisposed = true;
  }

  dispose() {
    if(!this._subscription) {
      this._isDisposeScheduled = true;
    }
    else {
      this._dispose();
    }
  }
}