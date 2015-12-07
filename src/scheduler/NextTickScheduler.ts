import {QueueScheduler} from './QueueScheduler';
import {Subscription} from '../Subscription';
import {Action} from './Action';
import {NextTickAction} from './NextTickAction';
import {QueueAction} from './QueueAction';

export class NextTickScheduler extends QueueScheduler {
  scheduleNow<T>(work: (x?: any) => Subscription<T>, state?: any): Action {
    return (this.scheduled ?
      new QueueAction(this, work) :
      new NextTickAction(this, work)).schedule(state);
  }
}