import { Observable } from '../../Observable';
import { merge as mergeStatic } from '../../internal/observable/merge';

Observable.merge = mergeStatic;

declare module '../../Observable' {
  namespace Observable {
    export let merge: typeof mergeStatic;
  }
}
