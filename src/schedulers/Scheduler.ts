import {Immediate} from '../util/Immediate';
import Subscription from '../Subscription';
import ImmediateScheduler from './ImmediateScheduler';
import NextTickScheduler from './NextTickScheduler';

export default class Scheduler {
  static immediate: ImmediateScheduler = new ImmediateScheduler();
  static nextTick: NextTickScheduler = new NextTickScheduler();
  now(): number {
    return Date.now();
  }
  schedule<T>(delay: number, state: any, work: (x?: any) => Subscription<T> | void): Subscription<T> {
    throw new Error("Scheduler.prototype.schedule not implemented.");
  }
}