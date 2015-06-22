import Scheduler from './Scheduler';
import SerialSubscription from '../SerialSubscription';
export declare class ScheduledAction extends SerialSubscription {
    scheduler: Scheduler;
    work: Function;
    state: any;
    id: any;
    constructor(scheduler: Scheduler, state: any, work: Function);
    schedule(): ScheduledAction;
    execute(): void;
    unsubscribe(): void;
}
export declare class NextScheduledAction extends ScheduledAction {
    schedule(): NextScheduledAction;
    unsubscribe(): void;
}
export declare class FutureScheduledAction extends ScheduledAction {
    delay: number;
    constructor(scheduler: Scheduler, state: any, work: Function, delay: number);
    schedule(): FutureScheduledAction;
    unsubscribe(): void;
}
