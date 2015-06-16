import Observable from '../Observable';
import zipAll from './zipAll';
import fromArray from '../observable/fromArray';

export default function zip(...observables):Observable {
  var project = observables.pop();
  if (typeof project !== "function") {
    observables.push(project);
    project = void 0;
  }
  if (typeof this.subscribe === "function") {
    observables.unshift(this);
  }
  return zipAll.call(fromArray(observables), project);
};