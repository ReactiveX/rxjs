import {Subscription} from '../Subscription';
import {QueueScheduler} from './QueueScheduler';

/**
 * WARNING: This should not be used directly. If you want to use a recursive scheduler, use the one provided in
 * either `Rx.Scheduler.none` or the module `"rxjs/scheduler/none"`.
 */
export class RecursiveScheduler extends QueueScheduler {
  scheduleNow<T>(work: (x?: T) => Subscription, state?: T): Subscription {
    work(state);
    return Subscription.EMPTY;
  }
}
