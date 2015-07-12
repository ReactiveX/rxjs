import Observable from './Observable';
import Observer from './Observer';
export default class Subject extends Observable {
    destination: Observer;
    disposed: boolean;
    observers: Array<Observer>;
    _dispose: () => void;
    unsubscribed: boolean;
    _next: (value: any) => void;
    _throw: (err: any) => void;
    _return: (value: any) => void;
    constructor();
    dispose(): void;
    next(value: any): void;
    throw(err: any): void;
    return(value: any): void;
    _cleanUnsubbedObservers(): void;
    unsubscribe(): void;
}
