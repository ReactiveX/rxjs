import { Observable } from '../../internal/Observable';
import { merge as mergeStatic } from '../../internal/observable/merge';

Observable.merge = mergeStatic;

declare module '../../internal/Observable' {
  namespace Observable {
    export let merge: typeof mergeStatic;
  }
}
