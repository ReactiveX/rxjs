import {FutureAction} from './FutureAction';
import {Subscription} from '../Subscription';
import {QueueScheduler} from './QueueScheduler';

export class AsyncScheduler extends QueueScheduler {
  scheduleNow<T>(work: (x?: T) => Subscription, state?: T): Subscription {
    return new FutureAction(this, work).schedule(state, 0);
  }
}
