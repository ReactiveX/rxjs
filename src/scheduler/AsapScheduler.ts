import {Action} from './Action';
import {AsapAction} from './AsapAction';
import {Subscription} from '../Subscription';
import {QueueScheduler} from './QueueScheduler';

export class AsapScheduler extends QueueScheduler {
  public scheduledId: number = null;
  scheduleNow<T>(work: (x?: any) => Subscription, state?: any): Action {
    return new AsapAction(this, work).schedule(state);
  }
}
