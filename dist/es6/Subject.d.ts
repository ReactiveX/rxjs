import Observable from './Observable';
import Observer from './Observer';
export interface IteratorResult<T> {
    value?: T;
    done: boolean;
}
export default class Subject extends Observable {
    destination: Observer;
    disposed: boolean;
    observers: Array<Observer>;
    _dispose: () => void;
    unsubscribed: boolean;
    _next: (value: any) => IteratorResult<any>;
    _throw: (err: any) => IteratorResult<any>;
    _return: (value: any) => IteratorResult<any>;
    dispose(): void;
    next(value: any): IteratorResult<any>;
    throw(err: any): IteratorResult<any>;
    return(value: any): IteratorResult<any>;
    _cleanUnsubbedObservers(): void;
    unsubscribe(): void;
}
