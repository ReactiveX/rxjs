import { Subscription } from './Subscription';
export default class CompositeSubscription implements Subscription {
    length: number;
    subscriptions: Array<Subscription>;
    isUnsubscribed: boolean;
    static from(subscriptions: Array<Subscription>): CompositeSubscription;
    unsubscribe(): void;
    add(subscription: Subscription): CompositeSubscription;
    remove(subscription: Subscription): CompositeSubscription;
    indexOf(subscription: Subscription): number;
}
