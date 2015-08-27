
export default class Subscription<T> {
  public static EMPTY: Subscription<void> = (function(empty){
    empty.isUnsubscribed = true;
    return empty;
  }(new Subscription<void>()));
  
  isUnsubscribed: boolean = false;

  _subscriptions: Subscription<any>[];
  
  _unsubscribe(): void { 
  }
  
  constructor(_unsubscribe?: () => void) {
    if (_unsubscribe) {
      this._unsubscribe = _unsubscribe;
    }
  }

  unsubscribe(): void {

    if (this.isUnsubscribed) {
      return;
    }

    this.isUnsubscribed = true;

    const unsubscribe = this._unsubscribe;
    const subscriptions = this._subscriptions;

    this._subscriptions = void 0;
    
    if (unsubscribe) {
      unsubscribe.call(this);
    }

    if (subscriptions != null) {
      let index = -1;
      const len = subscriptions.length;

      while (++index < len) {
        subscriptions[index].unsubscribe();
      }
    }
  }

  add(subscription: Subscription<T>|Function|void): void {
    // return early if: 
    //  1. the subscription is null
    //  2. we're attempting to add our this
    //  3. we're attempting to add the static `empty` Subscription
    if (!subscription || (
        subscription === this) || (
        subscription === Subscription.EMPTY)) {
      return;
    }

    let sub = (<Subscription<T>> subscription);

    switch(typeof subscription) {
      case "function":
        sub = new Subscription<void>(<(() => void) > subscription);
      case "object":
        if (sub.isUnsubscribed || typeof sub.unsubscribe !== "function") {
          break;
        } else if (this.isUnsubscribed) {
            sub.unsubscribe();
        } else {
          const subscriptions = this._subscriptions || (this._subscriptions = []);
          subscriptions.push(sub);
        }
        break;
      default:
        throw new Error('Unrecognized subscription ' + subscription + ' added to Subscription.');
    }
  }

  remove(subscription: Subscription<T>): void {

    // return early if: 
    //  1. the subscription is null
    //  2. we're attempting to remove ourthis
    //  3. we're attempting to remove the static `empty` Subscription
    if (subscription == null   || (
        subscription === this) || (
        subscription === Subscription.EMPTY)) {
      return;
    }

    const subscriptions = this._subscriptions;

    if (subscriptions) {
      const subscriptionIndex = subscriptions.indexOf(subscription);
      if (subscriptionIndex !== -1) {
        subscriptions.splice(subscriptionIndex, 1);
      }
    }
  }
}
