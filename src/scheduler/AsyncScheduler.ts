import {Action} from './Action';
import {FutureAction} from './FutureAction';
import {Subscription} from '../Subscription';
import {QueueScheduler} from './QueueScheduler';

export class AsyncScheduler extends QueueScheduler {
  scheduleNow<T>(work: (x?: T) => Subscription, state?: T): Action<T> {
    return new FutureAction(this, work).schedule(state, 0);
  }
}
