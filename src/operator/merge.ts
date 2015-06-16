import Observable from '../Observable';
import mergeAll from './mergeAll';
import fromArray from '../observable/fromArray';

export default function merge():Observable {
  var argsOff = 0;
  var argsIdx = -1;
  var argsLen = arguments.length;
  var observables = [];
  if (typeof this.subscribe === "function") {
    argsOff = 1;
    observables.push(this);
  }
  while (++argsIdx < argsLen) {
    observables[argsIdx + argsOff] = arguments[argsIdx];
  }
  return mergeAll.call(fromArray(observables));
};
