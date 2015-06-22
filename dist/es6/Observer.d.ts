export interface IteratorResult<T> {
    done: boolean;
    value?: T;
}
export default class Observer {
    destination: Observer;
    unsubscribed: boolean;
    static create(_next: (value: any) => IteratorResult<any>, _throw?: ((value: any) => IteratorResult<any>), _return?: ((value: any) => IteratorResult<any>), _dispose?: (() => void)): Observer;
    _dispose(): void;
    _next(value: any): IteratorResult<any>;
    _throw(error: any): IteratorResult<any>;
    _return(value: any): IteratorResult<any>;
    constructor(destination: Observer);
    next(value: any): IteratorResult<any>;
    throw(error: any): IteratorResult<any>;
    return(value?: any): IteratorResult<any>;
    unsubscribe(): void;
    dispose(): void;
}
