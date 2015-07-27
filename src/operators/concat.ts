import merge from './merge';
import Observable from '../Observable';

export default function concat(scheduler?: any, ...observables: Observable<any>[]) {
  if (scheduler && typeof scheduler.subscribe === "function") {
    return merge.apply(this, [1, scheduler].concat(observables));
  }
  return merge.apply(this, [scheduler, 1].concat(observables));
}