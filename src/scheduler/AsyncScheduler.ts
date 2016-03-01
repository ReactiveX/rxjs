import {Action} from './Action';
import {FutureAction} from './FutureAction';
import {Subscription} from '../Subscription';
import {QueueScheduler} from './QueueScheduler';

export class AsyncScheduler extends QueueScheduler {
  scheduleNow<T>(work: (x?: any) => Subscription, state?: any): Action {
    return new FutureAction(this, work).schedule(state, 0);
  }
}
