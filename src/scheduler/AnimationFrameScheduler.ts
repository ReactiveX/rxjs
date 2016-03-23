import {Action} from './Action';
import {Subscription} from '../Subscription';
import {QueueScheduler} from './QueueScheduler';
import {AnimationFrameAction} from './AnimationFrameAction';

export class AnimationFrameScheduler extends QueueScheduler {
  scheduleNow<T>(work: (x?: T) => Subscription, state?: T): Action<T> {
    return new AnimationFrameAction(this, work).schedule(state);
  }
}
