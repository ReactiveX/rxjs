import Subscription from './Subscription';
export default class CompositeSubscription extends Subscription {
    length: number;
    _subscriptions: Array<Subscription>;
    constructor();
    static from(subscriptions: Array<Subscription>): CompositeSubscription;
    unsubscribe(): void;
    add(subscription: Subscription): CompositeSubscription;
    remove(subscription: Subscription): CompositeSubscription;
    indexOf(subscription: Subscription): number;
}
