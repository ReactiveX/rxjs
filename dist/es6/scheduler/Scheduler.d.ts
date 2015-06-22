import Subscription from '../Subscription';
import { ScheduledAction, FutureScheduledAction } from './SchedulerActions';
export default class Scheduler {
    actions: Array<ScheduledAction>;
    active: boolean;
    scheduled: boolean;
    constructor();
    schedule(delay: number, state: any, work: Function): Subscription;
    flush(): void;
    scheduleNow(state: any, work: Function): ScheduledAction;
    scheduleLater(state: any, work: Function, delay: number): FutureScheduledAction;
}
