import Observable from '../Observable';

export default function merge(observables:Array<Observable>):Observable {
  return Observable.fromArray([this].concat(observables)).mergeAll();
}