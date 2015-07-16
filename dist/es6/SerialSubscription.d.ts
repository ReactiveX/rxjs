import { Subscription } from './Subscription';
export default class SerialSubscription implements Subscription {
    subscription: Subscription;
    isUnsubscribed: boolean;
    constructor(subscription: Subscription);
    add(subscription: Subscription): Subscription;
    remove(subscription: any): SerialSubscription;
    unsubscribe(): void;
}
