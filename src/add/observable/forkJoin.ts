import { Observable } from '../../Observable';
import { forkJoin as staticForkJoin } from '../../internal/observable/forkJoin';

Observable.forkJoin = staticForkJoin;

declare module '../../Observable' {
  namespace Observable {
    export let forkJoin: typeof staticForkJoin;
  }
}
