import {Action} from './Action';
import {AsapAction} from './AsapAction';
import {Subscription} from '../Subscription';
import {QueueScheduler} from './QueueScheduler';

export class AsapScheduler extends QueueScheduler {
  scheduleNow<T>(work: (x?: T) => Subscription, state?: T): Action<T> {
    return new AsapAction(this, work).schedule(state);
  }
}
