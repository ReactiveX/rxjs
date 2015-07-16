import Observable from './Observable';
import Subscriber from './Subscriber';
export default class Subject extends Observable {
    destination: Subscriber;
    disposed: boolean;
    subscribers: Array<Subscriber>;
    _dispose: () => void;
    unsubscribed: boolean;
    _next: (value: any) => void;
    _error: (err: any) => void;
    _complete: (value: any) => void;
    constructor();
    dispose(): void;
    next(value: any): void;
    error(err: any): void;
    complete(value: any): void;
    _cleanUnsubbedSubscribers(): void;
    unsubscribe(): void;
}
