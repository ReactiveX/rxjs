import Observable from '../Observable';
import combineAll from './combineAll';
import fromArray from '../observable/fromArray';

export default function combine(...observables):Observable {
  var project = observables.pop();
  if (typeof project !== "function") {
    observables.push(project);
    project = void 0;
  }
  if (typeof this.subscribe === "function") {
    observables.unshift(this);
  }
  return combineAll.call(fromArray(observables), project);
};