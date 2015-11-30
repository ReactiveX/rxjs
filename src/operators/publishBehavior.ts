import {BehaviorSubject} from '../subjects/BehaviorSubject';
import {Observable} from '../Observable';
import {multicast} from './multicast';

export function publishBehavior(value: any) {
  return multicast.call(this, new BehaviorSubject(value));
}

Observable.prototype.publishBehavior = publishBehavior;
