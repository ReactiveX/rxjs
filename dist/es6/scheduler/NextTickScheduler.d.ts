import Scheduler from './Scheduler';
import { ScheduledAction } from './SchedulerActions';
export default class NextTickScheduler extends Scheduler {
    scheduleNow(state: any, work: Function): ScheduledAction;
}
