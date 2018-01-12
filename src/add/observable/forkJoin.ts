import { Observable } from '../../internal/Observable';
import { forkJoin as staticForkJoin } from '../../internal/observable/forkJoin';

Observable.forkJoin = staticForkJoin;

declare module '../../internal/Observable' {
  namespace Observable {
    export let forkJoin: typeof staticForkJoin;
  }
}
