import Observer from './Observer';
export default class Subscription {
    length: number;
    unsubscribed: boolean;
    _unsubscribe: Function;
    observer: Observer;
    constructor(_unsubscribe: Function, observer: Observer);
    unsubscribe(): void;
    add(subscription: Subscription): Subscription;
    remove(subscription: Subscription): Subscription;
    static from(value: any, observer: Observer): Subscription;
}
