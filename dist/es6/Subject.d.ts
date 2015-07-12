import Observable from './Observable';
import Observer from './Observer';
export default class Subject extends Observable {
    destination: Observer;
    disposed: boolean;
    observers: Array<Observer>;
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
    _cleanUnsubbedObservers(): void;
    unsubscribe(): void;
}
