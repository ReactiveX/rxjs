import Observable from './Observable';
import Subscriber from './Subscriber';
import { Subscription } from './Subscription';
import { Observer } from './Observer';
export default class Subject extends Observable implements Observer, Subscription {
    destination: Subscriber;
    disposed: boolean;
    subscribers: Array<Subscriber>;
    isUnsubscribed: boolean;
    _next: (value: any) => void;
    _error: (err: any) => void;
    _complete: (value: any) => void;
    constructor();
    next(value: any): void;
    error(err: any): void;
    complete(value: any): void;
    add(subscriber: Subscriber): void;
    remove(subscriber: Subscriber): void;
    unsubscribe(): void;
}
