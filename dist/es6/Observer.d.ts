export default class Observer {
    destination: Observer;
    unsubscribed: boolean;
    static create(_next: (value: any) => void, _error?: ((value: any) => void), _completed?: ((value: any) => void)): Observer;
    _next(value: any): void;
    _error(error: any): void;
    _completed(value: any): void;
    constructor(destination: Observer);
    next(value: any): void;
    error(error: any): void;
    complete(value?: any): void;
    unsubscribe(): void;
}
