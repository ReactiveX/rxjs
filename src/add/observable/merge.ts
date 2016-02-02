import {Observable} from '../../Observable';
import {mergeStatic} from '../../operator/merge';

Observable.merge = mergeStatic;

declare module '../../Observable' {
  namespace Observable {
    export let merge: typeof mergeStatic;
  }
}