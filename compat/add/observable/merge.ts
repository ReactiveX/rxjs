import { Observable, merge as mergeStatic } from 'rxjs';

Observable.merge = mergeStatic;

declare module 'rxjs/internal/Observable' {
  namespace Observable {
    export let merge: typeof mergeStatic;
  }
}
