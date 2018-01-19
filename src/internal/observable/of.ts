import { IScheduler } from '../Scheduler';
import { isScheduler } from '../util/isScheduler';
import { fromArray } from './fromArray';
import { empty } from './empty';
import { scalar } from './scalar';

export function of<T>(...args: Array<T | IScheduler>) {
  let scheduler = args[args.length - 1] as IScheduler;
  if (isScheduler(scheduler)) {
    args.pop();
  } else {
    scheduler = undefined;
  }
  switch (args.length) {
    case 0:
      return empty(scheduler);
    case 1:
      return scheduler ? fromArray(args, scheduler) : scalar(args[0]);
    default:
      return fromArray(args, scheduler);
  }
}
