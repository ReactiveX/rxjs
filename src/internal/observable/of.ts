import { IScheduler } from '../Scheduler';
import { isScheduler } from '../util/isScheduler';
import { fromArray } from './fromArray';
import { empty } from './empty';
import { scalar } from './scalar';
import { Observable } from '../Observable';

export function of<T>(...args: Array<T | IScheduler>): Observable<T> {
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
      return scheduler ? fromArray(args as T[], scheduler) : scalar(args[0] as T);
    default:
      return fromArray(args as T[], scheduler);
  }
}
