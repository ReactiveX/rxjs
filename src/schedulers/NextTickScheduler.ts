import { Immediate } from '../util/Immediate';
import ImmediateScheduler from './ImmediateScheduler';
import Subscription from '../Subscription';
import Action from './Action';
import NextTickAction from './NextTickAction';

export default class NextTickScheduler extends ImmediateScheduler {
  scheduleNow<T>(work: (x?: any) => Subscription<T>, state?: any): Action<T> {
    return (this.scheduled ?
      new Action(this, work) :
      new NextTickAction(this, work)).schedule(state);
  }
}