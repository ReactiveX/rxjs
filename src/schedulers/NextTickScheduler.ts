import { Immediate } from '../util/Immediate';
import ImmediateScheduler from './ImmediateScheduler';
import Subscription from '../Subscription';
import Action from './Action';
import NextTickAction from './NextTickAction';
import ImmediateAction from './ImmediateAction';

export default class NextTickScheduler extends ImmediateScheduler {
  scheduleNow<T>(work: (x?: any) => Subscription<T>, state?: any): Action {
    return (this.scheduled ?
      new ImmediateAction(this, work) :
      new NextTickAction(this, work)).schedule(state);
  }
}