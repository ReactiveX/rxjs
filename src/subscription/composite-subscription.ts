import Subscription from './subscription';

export default class CompositeSubscription extends Subscription {
  _subscriptions:Array<Subscription>

  constructor(...subscriptions:Array<Subscription>) {
    super();
    this._subscriptions = subscriptions;
  }

  add(subscription:Subscription):void {
    this._subscriptions.push(subscription);
  }

  remove(subscription:Subscription):void {
    this._subscriptions.splice(this._subscriptions.indexOf(subscription), 1);
  }

  get length():number {
    return this._subscriptions.length;
  }

  dispose():void {
    while(this._subscriptions.length > 1) {
      var subcription = this._subscriptions.pop();
      subcription.dispose();
    }
    return Subscription.prototype.dispose.call(this);
  }
}