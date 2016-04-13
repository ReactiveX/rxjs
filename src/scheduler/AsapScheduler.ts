import {AsapAction} from './AsapAction';
import {Subscription} from '../Subscription';
import {QueueScheduler} from './QueueScheduler';

export class AsapScheduler extends QueueScheduler {
  scheduleNow<T>(work: (x?: T) => Subscription, state?: T): Subscription {
    return new AsapAction(this, work).schedule(state);
  }
}
