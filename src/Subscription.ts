export default class Subscription<T> {

  public static empty: Subscription<void> = ((empty) => {
    empty.isUnsubscribed = true;
    return empty;
  })(new Subscription<void>());
  
  isUnsubscribed: boolean = false;

  constructor(_unsubscribe?: () => void) {
    // hide `_unsubscribe` from TypeScript so we can implement Subscription
    if(_unsubscribe) {
      (<any> this)._unsubscribe = _unsubscribe;
    }
  }

  unsubscribe(): void {

    if (this.isUnsubscribed) {
      return;
    }

    this.isUnsubscribed = true;

    const self = (<any> this);
    const unsubscribe = self._unsubscribe;
    const subscriptions = self._subscriptions;

    self._subscriptions = void 0;

    if (unsubscribe != null) {
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

  add(subscription?: Subscription<T> | Function | void): void {

    // return early if: 
    //  1. the subscription is null
    //  2. we're attempting to add ourself
    //  3. we're attempting to add the static `empty` Subscription
    if (subscription == null || (
        subscription === this) || (
        subscription === Subscription.empty)) {
      return;
    }

    const self = (<any> this);
    let sub = (<Subscription<T>> subscription);

    switch(typeof sub) {
      case "function":
        sub = new Subscription<void>(<(() => void) > subscription);
      case "object":
        if (sub.isUnsubscribed || typeof sub.unsubscribe !== "function") {
          break;
        } else if (this.isUnsubscribed) {
            sub.unsubscribe();
        } else {
          const subscriptions = self._subscriptions || (self._subscriptions = []);
          subscriptions.push(sub);
        }
        break;
      default:
        throw new Error('Unrecognized subscription ' + subscription + ' added to Subscription.');
    }
  }

  remove(subscription?: Subscription<T>): void {

    // return early if: 
    //  1. the subscription is null
    //  2. we're attempting to remove ourself
    //  3. we're attempting to remove the static `empty` Subscription
    if (subscription == null   || (
        subscription === this) || (
        subscription === Subscription.empty)) {
      return;
    }

    const self = (<any> this);
    const subscriptions = self._subscriptions;

    if (subscriptions) {
      const subscriptionIndex = subscriptions.indexOf(subscription);
      if (subscriptionIndex !== -1) {
        subscriptions.splice(subscriptionIndex, 1);
      }
    }
  }
}
