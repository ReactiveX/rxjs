import {QueueScheduler} from './QueueScheduler';
import {Subscription} from '../Subscription';
import {Action} from './Action';
import {AsapAction} from './AsapAction';
import {QueueAction} from './QueueAction';

export class AsapScheduler extends QueueScheduler {
  scheduleNow<T>(work: (x?: any) => Subscription<T>, state?: any): Action {
    return (this.scheduled ?
      new QueueAction(this, work) :
      new AsapAction(this, work)).schedule(state);
  }
}