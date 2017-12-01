import { Observable } from '../../Observable';
import { defer as staticDefer } from '../../internal/observable/defer';

Observable.defer = staticDefer;

declare module '../../Observable' {
  namespace Observable {
    export let defer: typeof staticDefer;
  }
}
