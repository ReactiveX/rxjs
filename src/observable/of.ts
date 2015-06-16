import Observable from '../Observable';
import fromArray from './fromArray';
import Scheduler from '../Scheduler';

export default function of():Observable {

  var args, len = arguments.length,
    scheduler = arguments[len - 1];

  if (scheduler instanceof Scheduler) {
    len -= 1;
    args = new Array(len);
    for (var i = 0; i < len; i++) {
      args[i] = arguments[i];
    }
    return fromArray(args, scheduler);
  }

  args = new Array(len);
  for (var i = 0; i < len; i++) {
    args[i] = arguments[i];
  }

  return fromArray(args);
};