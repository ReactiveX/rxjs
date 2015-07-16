import { Observer } from './Observer';
import { Subscription } from './Subscription';

export default class Subscriber implements Observer, Subscription {
  isUnsubscribed: boolean = false;
  
  destination: Observer;
  
  subscriptions: Array<Subscription> = [];
  
  constructor(destination: Observer) {
    this.destination = destination;
  }
  
  next(value: any) {
    if (!this.isUnsubscribed) {
      this._next(value);
    }
  }
  
  _next(value: any) {
    if (this.destination) {
      this.destination.next(value);
    }  
  }
  
  error(err: any) {
    if (!this.isUnsubscribed) {
      this._error(err);
    }
  }
  
  _error(err: any) {
    let destination = this.destination;
    if (destination && destination.error) {
      destination.error(err);
    } else {
      throw err;
    }
  }

  complete(value: any = undefined) {
    if (!this.isUnsubscribed) {
      this._complete(value);
    }
  }

  _complete(value: any) {
    let destination = this.destination;
    if (destination && destination.complete) {
      destination.complete(value);
    }
  }
  
  subscribe(subscription: Subscription) {
    this._subscribe(subscription);
  }
  
  _subscribe(subscription: Subscription) {
    let destination = this.destination;
    if (destination && destination.subscribe) {
      destination.subscribe(subscription);
    }
  }
  
  unsubscribe() {
    this.isUnsubscribed = true;
    while (this.subscriptions.length > 1) {
      var sub = this.subscriptions.shift();
      sub.unsubscribe();
    }
  }
  
  add(subscriptionOrAction: Subscription|Function) {
    var subscription;
    if (typeof subscription === 'function') {
      let unsubscribe = subscription;
      subscription = { unsubscribe };
    } else {
      subscription = subscriptionOrAction;
    }
    this.subscriptions.push(subscription);
  }
  
  remove(subscription: Subscription) {
    var index = this.subscriptions.indexOf(subscription);
    if (index !== -1) {
      this.subscriptions.splice(index, 1);
    }
  }
}