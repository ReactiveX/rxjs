import { Subscription } from './Subscription';
export interface Observer {
    next(value: any): void;
    error(err: any): void;
    complete(value?: any): void;
    subscribe(subscription: Subscription): void;
}
