import Subscription from './Subscription';
export default class SerialSubscription extends Subscription {
    subscription: Subscription;
    constructor(subscription: Subscription);
    add(subscription: Subscription): Subscription;
    remove(subscription: any): SerialSubscription;
    unsubscribe(): void;
}
