import { Observer } from './Observer';
import { Subscription } from './Subscription';
export default class Subscriber implements Observer, Subscription {
    isUnsubscribed: boolean;
    destination: Observer;
    subscriptions: Array<Subscription>;
    constructor(destination: Observer);
    next(value: any): void;
    _next(value: any): void;
    error(err: any): void;
    _error(err: any): void;
    complete(value?: any): void;
    _complete(value: any): void;
    subscribe(subscription: Subscription): void;
    _subscribe(subscription: Subscription): void;
    unsubscribe(): void;
    add(subscriptionOrAction: Subscription | Function | void): void;
    remove(subscription: Subscription): void;
}
